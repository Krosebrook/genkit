// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//go:build debug
// +build debug

package genkit

import (
	"log"
	"os"
	"runtime"
	"runtime/debug"
	"runtime/pprof"
)

// DebugConfig holds debug configuration settings
type DebugConfig struct {
	EnableProfiling bool
	EnableTracing   bool
	LogLevel        string
	OutputDir       string
}

// DefaultDebugConfig returns default debug configuration
func DefaultDebugConfig() *DebugConfig {
	return &DebugConfig{
		EnableProfiling: true,
		EnableTracing:   true,
		LogLevel:        "debug",
		OutputDir:       "./debug-output",
	}
}

// SetupDebugEnvironment configures the debug environment
func SetupDebugEnvironment(config *DebugConfig) error {
	if config == nil {
		config = DefaultDebugConfig()
	}

	// Create debug output directory
	if err := os.MkdirAll(config.OutputDir, 0755); err != nil {
		return err
	}

	// Enable detailed GC tracing
	debug.SetGCPercent(100)

	// Set up CPU profiling if enabled
	if config.EnableProfiling {
		if err := setupCPUProfiling(config.OutputDir); err != nil {
			log.Printf("Failed to setup CPU profiling: %v", err)
		}
	}

	// Configure runtime settings for debugging
	runtime.GOMAXPROCS(runtime.NumCPU())

	log.Printf("Debug environment initialized with config: %+v", config)
	return nil
}

// setupCPUProfiling initializes CPU profiling
func setupCPUProfiling(outputDir string) error {
	cpuFile, err := os.Create(outputDir + "/cpu.prof")
	if err != nil {
		return err
	}

	if err := pprof.StartCPUProfile(cpuFile); err != nil {
		cpuFile.Close()
		return err
	}

	log.Println("CPU profiling enabled, output:", outputDir+"/cpu.prof")
	return nil
}

// StopProfiling stops all profiling
func StopProfiling() {
	pprof.StopCPUProfile()
	log.Println("Profiling stopped")
}

// PrintMemStats prints current memory statistics
func PrintMemStats() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	log.Printf("Memory Stats:")
	log.Printf("  Alloc = %d KB", bToKb(m.Alloc))
	log.Printf("  TotalAlloc = %d KB", bToKb(m.TotalAlloc))
	log.Printf("  Sys = %d KB", bToKb(m.Sys))
	log.Printf("  NumGC = %d", m.NumGC)
}

func bToKb(b uint64) uint64 {
	return b / 1024
}