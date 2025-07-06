#!/bin/bash

# PrivilegeOS Build Script with UEFI Boot Support
# This script builds a custom Linux kernel with embedded initramfs for UEFI boot

set -e

# Configuration
KERNEL_VERSION="5.15.0"
BUSYBOX_VERSION="1.35.0"
WORK_DIR="/tmp/privilegeos_build"
OUTPUT_DIR="$PWD/privilegeos_output"
INITRAMFS_DIR="$WORK_DIR/initramfs"
KERNEL_DIR="$WORK_DIR/linux-$KERNEL_VERSION"
BUSYBOX_DIR="$WORK_DIR/busybox-$BUSYBOX_VERSION"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create working directories
prepare_directories() {
    log_info "Creating working directories..."
    mkdir -p "$WORK_DIR" "$OUTPUT_DIR" "$INITRAMFS_DIR"
    
    # Create basic initramfs structure
    mkdir -p "$INITRAMFS_DIR"/{bin,sbin,etc,proc,sys,dev,tmp,usr/{bin,sbin},var,mnt,root}
    
    # Create device nodes
    mknod "$INITRAMFS_DIR/dev/console" c 5 1
    mknod "$INITRAMFS_DIR/dev/null" c 1 3
    mknod "$INITRAMFS_DIR/dev/zero" c 1 5
}

# Build BusyBox for initramfs
build_busybox() {
    log_info "Building BusyBox..."
    
    cd "$WORK_DIR"
    
    if [ ! -f "busybox-$BUSYBOX_VERSION.tar.bz2" ]; then
        wget "https://busybox.net/downloads/busybox-$BUSYBOX_VERSION.tar.bz2"
    fi
    
    if [ ! -d "$BUSYBOX_DIR" ]; then
        tar -xf "busybox-$BUSYBOX_VERSION.tar.bz2"
    fi
    
    cd "$BUSYBOX_DIR"
    
    # Configure BusyBox for static build
    make defconfig
    sed -i 's/# CONFIG_STATIC is not set/CONFIG_STATIC=y/' .config
    sed -i 's/CONFIG_STATIC=n/CONFIG_STATIC=y/' .config
    
    # Build BusyBox
    make -j$(nproc)
    
    # Install BusyBox to initramfs
    make CONFIG_PREFIX="$INITRAMFS_DIR" install
    
    log_info "BusyBox built and installed to initramfs"
}

# Create init script for initramfs
create_init_script() {
    log_info "Creating init script..."
    
    cat > "$INITRAMFS_DIR/init" << 'EOF'
#!/bin/sh

# PrivilegeOS Init Script
echo "Starting PrivilegeOS..."

# Mount essential filesystems
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev

# Create additional device nodes if needed
[ ! -e /dev/console ] && mknod /dev/console c 5 1
[ ! -e /dev/null ] && mknod /dev/null c 1 3

# Set up environment
export PATH=/bin:/sbin:/usr/bin:/usr/sbin
export HOME=/root
export TERM=linux

# Load essential modules if available
if [ -d /lib/modules ]; then
    echo "Loading kernel modules..."
    find /lib/modules -name "*.ko" -exec insmod {} \; 2>/dev/null || true
fi

# Start essential services
echo "PrivilegeOS initialization complete"
echo "Welcome to PrivilegeOS with UEFI Boot Support!"

# Check for NTFS support
if grep -q ntfs /proc/filesystems; then
    echo "NTFS support available"
else
    echo "Warning: NTFS support not available"
fi

# Start a shell
echo "Starting shell..."
exec /bin/sh
EOF

    chmod +x "$INITRAMFS_DIR/init"
    log_info "Init script created"
}

# Build kernel with embedded initramfs
build_kernel() {
    log_info "Building kernel with embedded initramfs..."
    
    cd "$WORK_DIR"
    
    # Download kernel source if not present
    if [ ! -f "linux-$KERNEL_VERSION.tar.xz" ]; then
        wget "https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-$KERNEL_VERSION.tar.xz"
    fi
    
    if [ ! -d "$KERNEL_DIR" ]; then
        tar -xf "linux-$KERNEL_VERSION.tar.xz"
    fi
    
    cd "$KERNEL_DIR"
    
    # Create kernel configuration
    make defconfig
    
    # Enable UEFI support
    scripts/config --enable CONFIG_EFI
    scripts/config --enable CONFIG_EFI_STUB
    scripts/config --enable CONFIG_EFI_MIXED
    scripts/config --enable CONFIG_FB_EFI
    
    # Enable initramfs support
    scripts/config --enable CONFIG_INITRAMFS_SOURCE
    scripts/config --enable CONFIG_INITRAMFS_ROOT_UID
    scripts/config --enable CONFIG_INITRAMFS_ROOT_GID
    
    # Enable NTFS support for PrivilegeOS
    scripts/config --enable CONFIG_NTFS_FS
    scripts/config --enable CONFIG_NTFS3_FS
    scripts/config --enable CONFIG_NTFS3_LZX_XPRESS
    
    # Enable other useful filesystems
    scripts/config --enable CONFIG_VFAT_FS
    scripts/config --enable CONFIG_FAT_FS
    scripts/config --enable CONFIG_EXT4_FS
    
    # Set initramfs source to our prepared directory
    scripts/config --set-str CONFIG_INITRAMFS_SOURCE "$INITRAMFS_DIR"
    scripts/config --set-val CONFIG_INITRAMFS_ROOT_UID 0
    scripts/config --set-val CONFIG_INITRAMFS_ROOT_GID 0
    
    # Build the kernel with embedded initramfs
    log_info "Compiling kernel (this may take a while)..."
    make -j$(nproc)
    
    # Copy the kernel to output directory
    cp arch/x86/boot/bzImage "$OUTPUT_DIR/vmlinuz-privilegeos"
    
    log_info "Kernel with embedded initramfs built successfully"
}

# Create UEFI disk image
create_uefi_disk_image() {
    log_info "Creating UEFI disk image..."
    
    local disk_image="$OUTPUT_DIR/privilegeos-uefi.img"
    local mount_point="/tmp/uefi_mount"
    
    # Create a 64MB disk image
    dd if=/dev/zero of="$disk_image" bs=1M count=64
    
    # Create GPT partition table
    parted -s "$disk_image" mklabel gpt
    
    # Create EFI System Partition (ESP)
    parted -s "$disk_image" mkpart primary fat32 1MiB 63MiB
    parted -s "$disk_image" set 1 esp on
    
    # Set up loop device
    local loop_device=$(losetup -f --show "$disk_image")
    local partition_device="${loop_device}p1"
    
    # Wait for partition device to be ready
    sleep 2
    
    # Create FAT32 filesystem on ESP
    mkfs.fat -F32 "$partition_device"
    
    # Mount the ESP
    mkdir -p "$mount_point"
    mount "$partition_device" "$mount_point"
    
    # Create UEFI boot structure
    mkdir -p "$mount_point/EFI/BOOT"
    
    # Copy kernel as UEFI bootloader
    # The kernel with EFI stub can boot directly as BOOTX64.EFI
    cp "$OUTPUT_DIR/vmlinuz-privilegeos" "$mount_point/EFI/BOOT/BOOTX64.EFI"
    
    # Create a startup.nsh for automatic boot (optional)
    cat > "$mount_point/startup.nsh" << 'EOF'
@echo off
echo Starting PrivilegeOS...
\EFI\BOOT\BOOTX64.EFI rdinit=/init
EOF
    
    # Create a simple boot configuration
    cat > "$mount_point/EFI/BOOT/boot.conf" << 'EOF'
# PrivilegeOS Boot Configuration
# The kernel includes embedded initramfs with rdinit=/init
title PrivilegeOS with UEFI Boot
linux /EFI/BOOT/BOOTX64.EFI
initrd 
options rdinit=/init console=tty0 console=ttyS0,115200n8
EOF
    
    # Unmount and clean up
    umount "$mount_point"
    losetup -d "$loop_device"
    rmdir "$mount_point"
    
    log_info "UEFI disk image created: $disk_image"
    log_info "The kernel has embedded initramfs and will boot with rdinit=/init"
}

# Create ISO image for testing
create_iso_image() {
    log_info "Creating ISO image for testing..."
    
    local iso_dir="$WORK_DIR/iso"
    local iso_file="$OUTPUT_DIR/privilegeos.iso"
    
    mkdir -p "$iso_dir/EFI/BOOT"
    
    # Copy UEFI bootloader
    cp "$OUTPUT_DIR/vmlinuz-privilegeos" "$iso_dir/EFI/BOOT/BOOTX64.EFI"
    
    # Create ISO using xorriso
    if command -v xorriso >/dev/null 2>&1; then
        xorriso -as mkisofs \
            -o "$iso_file" \
            -isohybrid-gpt-basdat \
            -e EFI/BOOT/BOOTX64.EFI \
            -no-emul-boot \
            "$iso_dir"
        
        log_info "ISO image created: $iso_file"
    else
        log_warn "xorriso not found, skipping ISO creation"
    fi
}

# Main build function
main() {
    log_info "Starting PrivilegeOS build with UEFI support..."
    
    # Check for required tools
    for tool in wget tar make gcc; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            log_error "Required tool '$tool' not found. Please install it."
            exit 1
        fi
    done
    
    prepare_directories
    build_busybox
    create_init_script
    build_kernel
    create_uefi_disk_image
    create_iso_image
    
    log_info "Build completed successfully!"
    log_info "Output files:"
    log_info "  - Kernel: $OUTPUT_DIR/vmlinuz-privilegeos"
    log_info "  - UEFI Disk Image: $OUTPUT_DIR/privilegeos-uefi.img"
    log_info "  - ISO Image: $OUTPUT_DIR/privilegeos.iso (if available)"
    
    log_info ""
    log_info "To test the UEFI boot:"
    log_info "1. Use the UEFI disk image with QEMU:"
    log_info "   qemu-system-x86_64 -bios OVMF.fd -hda $OUTPUT_DIR/privilegeos-uefi.img"
    log_info "2. Or boot from the ISO image:"
    log_info "   qemu-system-x86_64 -bios OVMF.fd -cdrom $OUTPUT_DIR/privilegeos.iso"
    log_info ""
    log_info "The kernel includes embedded initramfs with rdinit=/init to avoid kernel panic."
}

# Handle command line arguments
case "${1:-}" in
    "clean")
        log_info "Cleaning build directories..."
        rm -rf "$WORK_DIR" "$OUTPUT_DIR"
        log_info "Clean completed."
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [clean]"
        echo "  clean   - Remove build directories"
        echo "  (none)  - Build PrivilegeOS with UEFI support"
        exit 1
        ;;
esac