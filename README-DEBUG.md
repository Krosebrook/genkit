# Genkit Debug Build - Quick Reference

This document provides a quick reference for debugging the Google Genkit AI framework.

## 🚀 Quick Start

```bash
# 1. Set up debug environment
source debug.env
./bin/debug-tools setup

# 2. Build with debug info
pnpm debug:build

# 3. Start debugging
./bin/debug-tools start cli
```

## 📋 Available Commands

### Build Commands
```bash
pnpm debug:build          # Build all components
pnpm debug:build:js       # Build JavaScript only
pnpm debug:build:cli      # Build CLI tools only
pnpm debug:watch:core     # Watch core components
pnpm debug:test           # Run tests with debug output
```

### Debug Tools
```bash
./bin/debug-tools setup       # Setup debug environment
./bin/debug-tools info        # Show system info
./bin/debug-tools processes   # Check running processes
./bin/debug-tools start cli   # Start CLI debugging
./bin/debug-tools monitor     # Monitor debug logs
./bin/debug-tools report      # Generate debug report
./bin/debug-tools clean       # Clean debug artifacts
```

## 🔧 VS Code Integration

Debug configurations are pre-configured in `.vscode/launch.json`:

- **Debug Genkit CLI** - Debug the CLI with breakpoints
- **Debug Sample Apps** - Debug sample applications
- **Debug Tests** - Debug test suites
- **Attach to Process** - Attach to running Node.js process

## 📁 Debug Output

All debug output is organized in `debug-output/`:
- `logs/` - Debug log files
- `profiles/` - Performance profiles  
- `traces/` - Execution traces
- `dumps/` - Memory dumps

## 🌐 Environment Variables

Key debug environment variables (set via `source debug.env`):
```bash
DEBUG=genkit:*                    # Enable debug logging
LOG_LEVEL=debug                   # Set log level
NODE_OPTIONS="--inspect=9229"     # Enable Node.js debugging
OTEL_LOG_LEVEL=debug             # OpenTelemetry debug logs
```

## 🐛 Common Debug Scenarios

### Debug CLI Commands
```bash
# Build CLI with debug info
pnpm debug:build:cli

# Run CLI with debugging
DEBUG=genkit:* genkit start --debug
```

### Debug Core Components
```bash
# Start core in watch mode
pnpm debug:watch:core

# Run tests with debugging
DEBUG=genkit:* pnpm test:js
```

### Debug Sample Applications
```bash
# Build samples with debug info
pnpm build:js-samples

# Run sample with debugging
cd samples/js-chatbot
DEBUG=genkit:* npm run dev
```

## 🔍 Troubleshooting

### Port Conflicts
```bash
# Check port usage
./bin/debug-tools processes

# Kill processes on debug ports
./bin/killports 9229 4000 4001
```

### Build Issues
```bash
# Clean and rebuild
./bin/debug-tools clean
pnpm debug:build

# Check build status
./bin/debug-tools report
```

### Missing Dependencies
```bash
# Reinstall dependencies
pnpm setup

# Check system requirements
./bin/debug-tools info
```

## 📚 More Information

For detailed documentation, see `debug-build.md`.

For VS Code debugging, use the preconfigured launch configurations in the Debug panel.

For performance profiling, check the `debug-output/profiles/` directory after running debug sessions.