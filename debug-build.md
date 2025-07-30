# Genkit Debug Build Organization

## Overview
This document outlines the debug build setup and organization for the Google Genkit AI framework, which includes JavaScript/TypeScript, Python, and Go components.

## Project Structure
```
/workspace/
├── js/                    # JavaScript/TypeScript components
├── py/                    # Python components  
├── go/                    # Go components
├── genkit-tools/          # CLI and tooling
├── samples/               # Example applications
├── tests/                 # Test suites
└── scripts/               # Build and utility scripts
```

## Debug Build Configuration

### JavaScript/TypeScript Debug Builds

#### Current Configuration
- Source maps enabled in `js/tsup.common.ts` (`sourcemap: true`)
- TypeScript config in `js/tsconfig.json` with `sourceMap: true`
- Build targets: CommonJS and ESM formats

#### Debug Build Commands
```bash
# Build all JS components with debug info
pnpm build:js

# Build individual components with watch mode
cd js/core && pnpm build:watch
cd js/genkit && pnpm build:watch

# Run tests with debugging
cd js && pnpm test:all
```

### Go Debug Builds

#### Debug Build Commands
```bash
# Build Go components with debug symbols
cd go && go build -gcflags="all=-N -l" ./...

# Run tests with verbose output
cd go && go test -v ./...
```

### Python Debug Builds

#### Debug Build Commands
```bash
# Install in development mode
cd py && pip install -e .

# Run tests with debugging
cd py && python -m pytest -v
```

### CLI Tools Debug

#### Debug Build Commands
```bash
# Build CLI with debug info
cd genkit-tools/cli && pnpm build:watch

# Run CLI in debug mode
genkit --debug [command]
```

## Debug Development Workflow

### 1. Initial Setup
```bash
# Install all dependencies
pnpm setup

# Link CLI globally
pnpm link-genkit-cli
```

### 2. Development Build
```bash
# Build all components in debug mode
pnpm build

# Or build specific components
pnpm build:js
pnpm build:genkit-tools
```

### 3. Testing with Debug
```bash
# Run all tests
pnpm test:all

# Run specific test suites
pnpm test:js
pnpm test:genkit-tools
```

### 4. Debug Sample Applications
```bash
# Build sample applications
pnpm build:js-samples

# Run specific samples with debugging
cd samples/js-chatbot && npm run dev
```

## Debug Tools and Utilities

### Available Debug Scripts
- `bin/killports` - Kill processes on specific ports
- `bin/run_go_tests` - Run Go tests with proper setup
- `bin/run_lint` - Run linting with debug output
- `scripts/copyright.ts` - Copyright management

### Environment Variables
```bash
# Enable debug logging
export DEBUG=genkit:*

# Set log level
export LOG_LEVEL=debug

# Enable OpenTelemetry tracing
export OTEL_LOG_LEVEL=debug
```

## IDE Configuration

### VS Code Debug Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Genkit CLI",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/genkit-tools/cli/dist/bin/genkit.js",
      "args": ["start"],
      "console": "integratedTerminal",
      "sourceMaps": true
    },
    {
      "name": "Debug Sample App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/samples/js-chatbot/lib/index.js",
      "console": "integratedTerminal",
      "sourceMaps": true
    }
  ]
}
```

## Troubleshooting

### Common Issues
1. **Source maps not working**: Ensure `sourcemap: true` in tsup configs
2. **TypeScript compilation errors**: Check `tsconfig.json` settings
3. **Missing dependencies**: Run `pnpm install` in respective directories
4. **Port conflicts**: Use `bin/killports` to clean up

### Debug Logging
Enable verbose logging for different components:
```bash
# JavaScript components
DEBUG=genkit:* node your-app.js

# CLI debugging
genkit --debug start

# Python debugging
PYTHONPATH=. python -m pdb your-script.py
```

## Performance Profiling

### JavaScript Profiling
```bash
# Profile with Node.js inspector
node --inspect-brk your-app.js

# Profile with clinic.js
npx clinic doctor -- node your-app.js
```

### Go Profiling
```bash
# Build with profiling
go build -race ./...

# CPU profiling
go test -cpuprofile=cpu.prof -bench=.
```

## Continuous Integration Debug

### GitHub Actions Debug
Enable debug logging in CI:
```yaml
- name: Debug build
  run: |
    export DEBUG=*
    pnpm build
  env:
    RUNNER_DEBUG: 1
```

## Quick Start Guide

### 1. Initial Setup
```bash
# Set up debug environment
source debug.env
./bin/debug-tools setup

# Verify system requirements
./bin/debug-tools info
```

### 2. Build with Debug Info
```bash
# Build all components with debug information
pnpm debug:build

# Or build specific components
pnpm debug:build:js
pnpm debug:build:cli
```

### 3. Start Development with Debugging
```bash
# Start core components in watch mode
pnpm debug:watch:core

# Start CLI debugging session
./bin/debug-tools start cli

# Start full debug session
./bin/debug-tools start all
```

### 4. Monitor and Debug
```bash
# Monitor debug logs in real-time
./bin/debug-tools monitor

# Generate comprehensive debug report
./bin/debug-tools report

# Check running processes and ports
./bin/debug-tools processes
```

## Available Debug Scripts

### Package.json Scripts
- `pnpm debug:build` - Build all components with debug info
- `pnpm debug:build:js` - Build only JavaScript components
- `pnpm debug:build:cli` - Build only CLI tools
- `pnpm debug:watch:core` - Watch core components for changes
- `pnpm debug:watch:cli` - Watch CLI components for changes
- `pnpm debug:test` - Run tests with debug output
- `pnpm debug:clean` - Clean debug artifacts

### Debug Tools Commands
- `./bin/debug-tools setup` - Set up debug environment
- `./bin/debug-tools info` - Show system information
- `./bin/debug-tools processes` - Check running processes
- `./bin/debug-tools start [component]` - Start debug session
- `./bin/debug-tools monitor` - Monitor debug logs
- `./bin/debug-tools report` - Generate debug report
- `./bin/debug-tools clean` - Clean debug artifacts

## Debug Configuration Files

### Environment Configuration
- `debug.env` - Debug environment variables
- `.vscode/launch.json` - VS Code debug configurations
- `.vscode/tasks.json` - VS Code build tasks

### Language-Specific Configs
- `js/tsconfig.debug.json` - TypeScript debug configuration
- `go/debug.go` - Go debug utilities (build with `-tags debug`)
- `py/debug_config.py` - Python debug configuration

## Debug Output Structure
```
debug-output/
├── logs/           # Debug log files
├── profiles/       # Performance profiles
├── traces/         # Execution traces
└── dumps/          # Memory dumps and crash reports
```

## Next Steps
1. ✅ Set up enhanced debug configurations
2. ✅ Create debug-specific build variants  
3. ✅ Implement automated debug testing
4. ✅ Add performance monitoring tools
5. Ready for development and debugging!