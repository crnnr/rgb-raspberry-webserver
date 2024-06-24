#include "led-matrix.h"
#include "graphics.h"
#include <iostream>
#include <unistd.h>  // For sleep()

using namespace rgb_matrix;

// Function to clear the entire LED matrix
void ClearCanvas(RGBMatrix *matrix) {
    FrameCanvas *canvas = matrix->CreateFrameCanvas();
    canvas->Clear();  // Set all pixels in the current canvas to black (or the default off state)
    matrix->SwapOnVSync(canvas);
}

int main() {
    RGBMatrix::Options options;
    RuntimeOptions runtime_options;

    // Basic Options - Adjust these to match your specific hardware
    options.hardware_mapping = "regular";  // Use "adafruit-hat" for Adafruit HAT
    options.rows = 64;                     // Number of rows in one panel of your matrix
    options.cols = 64;                     // Number of columns in one panel of your matrix
    options.chain_length = 3;              // Number of daisy-chained panels
    options.parallel = 2;                  // Number of parallel chains
    options.brightness = 100;
    options.gpio_slowdown = 4;
    // Initialization
    RGBMatrix *matrix = RGBMatrix::CreateFromOptions(options, runtime_options);
    if (matrix == nullptr) {
        std::cerr << "Failed to initialize matrix. Check your hardware settings." << std::endl;
        return 1;
    }

    std::cout << "Clearing the matrix. This will turn off all LEDs." << std::endl;

    // Clear the canvas
    ClearCanvas(matrix);

    // Sleep for a little while to let the human eye catch
    sleep(2);  // Sleep for 2 seconds; adjust as needed

    // Cleanup and shutdown
    delete matrix;  // Turns off the matrix and cleans up resources

    std::cout << "Matrix cleared and program exited." << std::endl;
    return 0;
}
