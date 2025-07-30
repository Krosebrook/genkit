#!/usr/bin/env node

/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEBUG_ENV = {
  DEBUG: 'genkit:*',
  LOG_LEVEL: 'debug',
  NODE_ENV: 'development',
  OTEL_LOG_LEVEL: 'debug'
};

class DebugBuilder {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.components = [
      { name: 'JavaScript Core', path: 'js', buildCmd: 'pnpm build:js' },
      { name: 'CLI Tools', path: 'genkit-tools', buildCmd: 'pnpm build:genkit-tools' },
      { name: 'Python', path: 'py', buildCmd: 'pip install -e .' },
      { name: 'Go', path: 'go', buildCmd: 'go build -gcflags="all=-N -l" ./...' }
    ];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warn: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[level]}[${timestamp}] ${message}${colors.reset}`);
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...');
    
    const commands = [
      { cmd: 'node --version', name: 'Node.js' },
      { cmd: 'pnpm --version', name: 'pnpm' },
      { cmd: 'go version', name: 'Go', optional: true },
      { cmd: 'python --version', name: 'Python', optional: true }
    ];

    for (const { cmd, name, optional } of commands) {
      try {
        const version = execSync(cmd, { encoding: 'utf8' }).trim();
        this.log(`✓ ${name}: ${version}`, 'success');
      } catch (error) {
        if (optional) {
          this.log(`⚠ ${name}: Not found (optional)`, 'warn');
        } else {
          this.log(`✗ ${name}: Not found`, 'error');
          throw new Error(`${name} is required but not found`);
        }
      }
    }
  }

  async setupEnvironment() {
    this.log('Setting up debug environment...');
    
    // Set environment variables
    Object.assign(process.env, DEBUG_ENV);
    
    // Create debug directories if they don't exist
    const debugDirs = ['.vscode', 'logs', 'debug-output'];
    for (const dir of debugDirs) {
      const dirPath = path.join(this.workspaceRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.log(`Created directory: ${dir}`, 'success');
      }
    }
  }

  async buildComponent(component) {
    this.log(`Building ${component.name}...`);
    
    const componentPath = path.join(this.workspaceRoot, component.path);
    if (!fs.existsSync(componentPath)) {
      this.log(`⚠ Skipping ${component.name}: Directory not found`, 'warn');
      return;
    }

    try {
      const startTime = Date.now();
      
      // Change to component directory and run build
      process.chdir(componentPath);
      execSync(component.buildCmd, { 
        stdio: 'inherit',
        env: { ...process.env, ...DEBUG_ENV }
      });
      
      const duration = Date.now() - startTime;
      this.log(`✓ ${component.name} built successfully (${duration}ms)`, 'success');
      
      // Return to workspace root
      process.chdir(this.workspaceRoot);
    } catch (error) {
      this.log(`✗ Failed to build ${component.name}: ${error.message}`, 'error');
      process.chdir(this.workspaceRoot);
      throw error;
    }
  }

  async buildAll() {
    this.log('Starting debug build for all components...');
    
    for (const component of this.components) {
      await this.buildComponent(component);
    }
    
    this.log('All components built successfully!', 'success');
  }

  async buildSpecific(componentNames) {
    this.log(`Building specific components: ${componentNames.join(', ')}`);
    
    const selectedComponents = this.components.filter(comp => 
      componentNames.some(name => 
        comp.name.toLowerCase().includes(name.toLowerCase()) ||
        comp.path.toLowerCase().includes(name.toLowerCase())
      )
    );

    if (selectedComponents.length === 0) {
      throw new Error(`No components found matching: ${componentNames.join(', ')}`);
    }

    for (const component of selectedComponents) {
      await this.buildComponent(component);
    }
  }

  async watchMode(componentName) {
    this.log(`Starting watch mode for ${componentName}...`);
    
    const watchCommands = {
      'js': 'cd js && pnpm -r --workspace-concurrency -1 run build:watch',
      'core': 'cd js/core && pnpm build:watch',
      'cli': 'cd genkit-tools/cli && pnpm build:watch',
      'genkit': 'cd js/genkit && pnpm build:watch'
    };

    const cmd = watchCommands[componentName.toLowerCase()];
    if (!cmd) {
      throw new Error(`Watch mode not available for: ${componentName}`);
    }

    this.log(`Running: ${cmd}`, 'info');
    const child = spawn('bash', ['-c', cmd], {
      stdio: 'inherit',
      env: { ...process.env, ...DEBUG_ENV }
    });

    child.on('exit', (code) => {
      this.log(`Watch mode exited with code ${code}`, code === 0 ? 'success' : 'error');
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      this.log('Stopping watch mode...', 'info');
      child.kill('SIGINT');
      process.exit(0);
    });
  }

  async runTests() {
    this.log('Running debug tests...');
    
    const testCommands = [
      'pnpm test:js',
      'pnpm test:genkit-tools'
    ];

    for (const cmd of testCommands) {
      try {
        this.log(`Running: ${cmd}`);
        execSync(cmd, { 
          stdio: 'inherit',
          env: { ...process.env, ...DEBUG_ENV }
        });
        this.log(`✓ ${cmd} passed`, 'success');
      } catch (error) {
        this.log(`✗ ${cmd} failed`, 'error');
        throw error;
      }
    }
  }

  printUsage() {
    console.log(`
Usage: node scripts/debug-build.js [command] [options]

Commands:
  all                    Build all components in debug mode (default)
  js                     Build only JavaScript components
  cli                    Build only CLI tools
  python                 Build only Python components
  go                     Build only Go components
  watch <component>      Start watch mode for a component (js, core, cli, genkit)
  test                   Run all tests in debug mode
  clean                  Clean all build artifacts

Options:
  --help, -h            Show this help message
  --verbose, -v         Enable verbose output

Examples:
  node scripts/debug-build.js all
  node scripts/debug-build.js js cli
  node scripts/debug-build.js watch core
  node scripts/debug-build.js test
    `);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const builder = new DebugBuilder();

  if (args.includes('--help') || args.includes('-h')) {
    builder.printUsage();
    return;
  }

  try {
    await builder.checkPrerequisites();
    await builder.setupEnvironment();

    if (args.length === 0 || args.includes('all')) {
      await builder.buildAll();
    } else if (args.includes('watch')) {
      const componentIndex = args.indexOf('watch') + 1;
      const component = args[componentIndex] || 'js';
      await builder.watchMode(component);
    } else if (args.includes('test')) {
      await builder.runTests();
    } else if (args.includes('clean')) {
      builder.log('Cleaning build artifacts...');
      execSync('pnpm run build:clean || true', { stdio: 'inherit' });
      builder.log('Clean completed', 'success');
    } else {
      await builder.buildSpecific(args);
    }

  } catch (error) {
    builder.log(`Build failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DebugBuilder;