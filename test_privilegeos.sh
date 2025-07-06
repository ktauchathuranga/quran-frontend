#!/bin/bash

# Test script for PrivilegeOS UEFI boot setup
# This script validates the build_privilegeos.sh functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[TEST-INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[TEST-WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[TEST-ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[TEST-SUCCESS]${NC} $1"
}

# Test 1: Check if build script exists and is executable
test_script_exists() {
    log_info "Testing if build script exists and is executable..."
    
    if [ ! -f "build_privilegeos.sh" ]; then
        log_error "build_privilegeos.sh not found"
        return 1
    fi
    
    if [ ! -x "build_privilegeos.sh" ]; then
        log_error "build_privilegeos.sh is not executable"
        return 1
    fi
    
    log_success "Build script exists and is executable"
    return 0
}

# Test 2: Check if script has required functions
test_required_functions() {
    log_info "Testing if required functions are present..."
    
    local required_functions=("build_kernel" "create_uefi_disk_image")
    
    for func in "${required_functions[@]}"; do
        if ! grep -q "^$func()" build_privilegeos.sh; then
            log_error "Function '$func' not found in build script"
            return 1
        fi
    done
    
    log_success "All required functions are present"
    return 0
}

# Test 3: Check if script has UEFI configuration
test_uefi_configuration() {
    log_info "Testing UEFI configuration..."
    
    local uefi_configs=("CONFIG_EFI" "CONFIG_EFI_STUB" "BOOTX64.EFI" "rdinit=/init")
    
    for config in "${uefi_configs[@]}"; do
        if ! grep -q "$config" build_privilegeos.sh; then
            log_error "UEFI configuration '$config' not found in build script"
            return 1
        fi
    done
    
    log_success "UEFI configuration is present"
    return 0
}

# Test 4: Check if script has initramfs embedding
test_initramfs_embedding() {
    log_info "Testing initramfs embedding configuration..."
    
    local initramfs_configs=("CONFIG_INITRAMFS_SOURCE" "embedded initramfs")
    
    for config in "${initramfs_configs[@]}"; do
        if ! grep -q "$config" build_privilegeos.sh; then
            log_error "Initramfs configuration '$config' not found in build script"
            return 1
        fi
    done
    
    log_success "Initramfs embedding configuration is present"
    return 0
}

# Test 5: Check if script has proper init script
test_init_script_creation() {
    log_info "Testing init script creation..."
    
    if ! grep -q "#!/bin/sh" build_privilegeos.sh; then
        log_error "Init script shebang not found"
        return 1
    fi
    
    if ! grep -q "rdinit=/init" build_privilegeos.sh; then
        log_error "rdinit=/init parameter not found"
        return 1
    fi
    
    if ! grep -q "exec /bin/sh" build_privilegeos.sh; then
        log_error "Shell execution not found in init script"
        return 1
    fi
    
    log_success "Init script creation is properly configured"
    return 0
}

# Test 6: Check if script has NTFS support
test_ntfs_support() {
    log_info "Testing NTFS support configuration..."
    
    local ntfs_configs=("CONFIG_NTFS_FS" "CONFIG_NTFS3_FS")
    
    for config in "${ntfs_configs[@]}"; do
        if ! grep -q "$config" build_privilegeos.sh; then
            log_error "NTFS configuration '$config' not found in build script"
            return 1
        fi
    done
    
    log_success "NTFS support configuration is present"
    return 0
}

# Test 7: Dry run test (syntax check)
test_syntax() {
    log_info "Testing script syntax..."
    
    if ! bash -n build_privilegeos.sh; then
        log_error "Script has syntax errors"
        return 1
    fi
    
    log_success "Script syntax is valid"
    return 0
}

# Test 8: Check help functionality
test_help_functionality() {
    log_info "Testing help functionality..."
    
    if ! ./build_privilegeos.sh help 2>&1 | grep -q "Usage:"; then
        log_error "Help functionality not working"
        return 1
    fi
    
    log_success "Help functionality is working"
    return 0
}

# Main test function
main() {
    log_info "Starting PrivilegeOS UEFI boot setup tests..."
    
    local total_tests=8
    local passed_tests=0
    local failed_tests=0
    
    # Run all tests
    local tests=(
        "test_script_exists"
        "test_required_functions"
        "test_uefi_configuration"
        "test_initramfs_embedding"
        "test_init_script_creation"
        "test_ntfs_support"
        "test_syntax"
        "test_help_functionality"
    )
    
    for test_func in "${tests[@]}"; do
        if $test_func; then
            ((passed_tests++))
        else
            ((failed_tests++))
        fi
        echo ""
    done
    
    # Summary
    log_info "Test Results:"
    log_info "  Total tests: $total_tests"
    log_info "  Passed: $passed_tests"
    log_info "  Failed: $failed_tests"
    
    if [ $failed_tests -eq 0 ]; then
        log_success "All tests passed! The UEFI boot setup is correctly implemented."
        return 0
    else
        log_error "Some tests failed. Please review the implementation."
        return 1
    fi
}

# Run tests
main