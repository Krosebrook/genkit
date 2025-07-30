# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Debug configuration and utilities for Genkit Python components."""

import logging
import os
import sys
import traceback
import warnings
from pathlib import Path
from typing import Optional

# Enable all warnings in debug mode
warnings.filterwarnings("default")

# Configure logging for debug mode
DEBUG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s"


class DebugConfig:
    """Debug configuration for Python components."""
    
    def __init__(
        self,
        log_level: str = "DEBUG",
        enable_profiling: bool = True,
        enable_tracing: bool = True,
        output_dir: str = "./debug-output",
        enable_warnings: bool = True,
    ):
        self.log_level = log_level
        self.enable_profiling = enable_profiling
        self.enable_tracing = enable_tracing
        self.output_dir = Path(output_dir)
        self.enable_warnings = enable_warnings
        
    def setup(self) -> None:
        """Set up the debug environment."""
        # Create debug output directory
        self.output_dir.mkdir(exist_ok=True)
        
        # Configure logging
        self._setup_logging()
        
        # Enable detailed tracebacks
        if self.enable_tracing:
            self._setup_tracing()
            
        # Configure warnings
        if self.enable_warnings:
            self._setup_warnings()
            
        # Set up profiling if enabled
        if self.enable_profiling:
            self._setup_profiling()
            
        logging.debug(f"Debug environment initialized: {self}")
        
    def _setup_logging(self) -> None:
        """Configure debug logging."""
        logging.basicConfig(
            level=getattr(logging, self.log_level.upper()),
            format=DEBUG_FORMAT,
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler(self.output_dir / "debug.log"),
            ],
        )
        
        # Set specific logger levels
        logging.getLogger("genkit").setLevel(logging.DEBUG)
        logging.getLogger("urllib3").setLevel(logging.WARNING)
        
    def _setup_tracing(self) -> None:
        """Set up enhanced tracing."""
        def excepthook(exc_type, exc_value, exc_traceback):
            """Enhanced exception handler with full traceback."""
            if issubclass(exc_type, KeyboardInterrupt):
                sys.__excepthook__(exc_type, exc_value, exc_traceback)
                return
                
            logging.error(
                "Uncaught exception",
                exc_info=(exc_type, exc_value, exc_traceback)
            )
            
            # Write detailed traceback to file
            with open(self.output_dir / "traceback.log", "a") as f:
                traceback.print_exception(
                    exc_type, exc_value, exc_traceback, file=f
                )
                
        sys.excepthook = excepthook
        
    def _setup_warnings(self) -> None:
        """Configure warning handling."""
        def warning_handler(message, category, filename, lineno, file=None, line=None):
            """Custom warning handler."""
            warning_msg = f"{category.__name__}: {message} ({filename}:{lineno})"
            logging.warning(warning_msg)
            
            # Write warnings to file
            with open(self.output_dir / "warnings.log", "a") as f:
                f.write(f"{warning_msg}\n")
                
        warnings.showwarning = warning_handler
        
    def _setup_profiling(self) -> None:
        """Set up profiling utilities."""
        try:
            import cProfile
            import pstats
            
            self.profiler = cProfile.Profile()
            logging.debug("Profiling enabled")
        except ImportError:
            logging.warning("cProfile not available, profiling disabled")
            self.enable_profiling = False
            
    def start_profiling(self) -> None:
        """Start profiling."""
        if self.enable_profiling and hasattr(self, 'profiler'):
            self.profiler.enable()
            logging.debug("Profiling started")
            
    def stop_profiling(self) -> None:
        """Stop profiling and save results."""
        if self.enable_profiling and hasattr(self, 'profiler'):
            self.profiler.disable()
            
            # Save profiling results
            profile_file = self.output_dir / "profile.prof"
            self.profiler.dump_stats(str(profile_file))
            
            # Generate readable stats
            with open(self.output_dir / "profile_stats.txt", "w") as f:
                stats = pstats.Stats(str(profile_file), stream=f)
                stats.sort_stats('cumulative')
                stats.print_stats()
                
            logging.debug(f"Profiling results saved to {profile_file}")
            
    def __str__(self) -> str:
        return (
            f"DebugConfig(log_level={self.log_level}, "
            f"profiling={self.enable_profiling}, "
            f"tracing={self.enable_tracing}, "
            f"output_dir={self.output_dir})"
        )


# Global debug configuration
_debug_config: Optional[DebugConfig] = None


def setup_debug_environment(config: Optional[DebugConfig] = None) -> DebugConfig:
    """Set up the global debug environment."""
    global _debug_config
    
    if config is None:
        config = DebugConfig()
        
    config.setup()
    _debug_config = config
    
    return config


def get_debug_config() -> Optional[DebugConfig]:
    """Get the current debug configuration."""
    return _debug_config


def debug_function(func):
    """Decorator to add debug logging to functions."""
    def wrapper(*args, **kwargs):
        func_name = f"{func.__module__}.{func.__name__}"
        logging.debug(f"Entering {func_name} with args={args}, kwargs={kwargs}")
        
        try:
            result = func(*args, **kwargs)
            logging.debug(f"Exiting {func_name} with result={result}")
            return result
        except Exception as e:
            logging.error(f"Exception in {func_name}: {e}", exc_info=True)
            raise
            
    return wrapper


# Auto-setup debug environment if DEBUG environment variable is set
if os.getenv("DEBUG") or os.getenv("LOG_LEVEL") == "debug":
    setup_debug_environment()