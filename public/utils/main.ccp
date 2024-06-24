int main() {
    RGBMatrix::Options options;
    RuntimeOptions runtime_options;

    // Configure your matrix options and runtime options
    options.rows = 64;
    options.cols = 64;
    options.chain_length = 1;
    options.parallel = 1;
    options.hardware_mapping = "regular";  // or another hardware mapping as per your setup

    RGBMatrix *matrix = RGBMatrix::CreateFromOptions(options, runtime_options);
    if (matrix == NULL) {
        std::cerr << "Failed to create matrix. Check hardware configuration." << std::endl;
        return 1;
    }

    ClearCanvas(matrix);  // Clear the matrix initially

    void ClearCanvas(RGBMatrix *matrix) {
	FrameCanvas *canvas = matrix->CreateFrameCanvas();
	canvas->Clear();  // Set all pixels in the current canvas to black (or the default off state)
	matrix->SwapOnVSync(canvas);
    }


    delete matrix;  // This turns off the matrix and cleans up resources
    return 0;
}
