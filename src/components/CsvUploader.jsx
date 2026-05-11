import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import api from '../api/axiosConfig';

// Tailwind CSS only Circular Loader Component
const CircularLoader = ({ size = 50, color = 'blue-500' }) => (
    <div
        className={`animate-spin rounded-full border-t-4 border-solid border-${color} border-opacity-75`}
        style={{
            height: size,
            width: size,
            borderColor: `var(--tw-border-${color})`, // Ensure custom color works with Tailwind variables
            borderTopColor: `var(--tw-border-${color})`, // Same for top border
        }}
    ></div>
);













const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="31" viewBox="0 0 36 31" fill="none" className="size-8 mt-12">
        <path
            d="M13 2.25H9.52C8.71825 2.25015 7.93765 2.50725 7.29274 2.98358C6.64783 3.45992 6.17256 4.1304 5.93667 4.89667L1.91667 17.9617C1.80656 18.3185 1.75039 18.6899 1.75 19.0633V26C1.75 26.9946 2.14509 27.9484 2.84835 28.6516C3.55161 29.3549 4.50544 29.75 5.5 29.75H30.5C31.4946 29.75 32.4484 29.3549 33.1516 28.6516C33.8549 27.9484 34.25 26.9946 34.25 26V19.0633C34.25 18.69 34.1933 18.3183 34.0833 17.9617L30.0667 4.89667C29.8308 4.1304 29.3555 3.45992 28.7106 2.98358C28.0657 2.50725 27.2851 2.25015 26.4833 2.25H23M1.75 18.5H8.18333C8.87966 18.5002 9.56219 18.6942 10.1545 19.0604C10.7467 19.4266 11.2253 19.9505 11.5367 20.5733L11.9633 21.4267C12.2748 22.0498 12.7537 22.5738 13.3463 22.94C13.9388 23.3062 14.6217 23.5001 15.3183 23.5H20.6817C21.3783 23.5001 22.0612 23.3062 22.6537 22.94C23.2463 22.5738 23.7252 22.0498 24.0367 21.4267L24.4633 20.5733C24.7748 19.9502 25.2537 19.4262 25.8463 19.06C26.4388 18.6938 27.1217 18.4999 27.8183 18.5H34.25M18 1V14.75M18 14.75L13 9.75M18 14.75L23 9.75"
            stroke="#007836"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);


const CsvUploader = ({ uploadEndpoint = 'user-management/upload-user', onUploadComplete }) => {
    // --- State Variables ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFileDropped, setIsFileDropped] = useState(false);
    const [fileName, setFileName] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
    const [uploadError, setUploadError] = useState(null);

    // --- Helper Functions ---

    /**
     * Resets all state variables to their initial values, effectively closing
     * modals and clearing any loaded data or status messages.
     */
    const resetState = () => {
        setIsModalOpen(false);
        setIsFileDropped(false);
        setFileName('');
        setParsedData([]);
        setIsLoading(false);
        setLoadingMessage('');
        setIsConfirmModalOpen(false);
        setUploadStatus('idle');
        setUploadError(null);
    };

    /**
     * Opens the main drag-and-drop modal and ensures a clean state beforehand.
     */
    const handleOpenModal = () => {
        resetState(); // Ensure a clean state when opening
        setIsModalOpen(true);
    };

    /**
     * Closes the main drag-and-drop modal and resets its state.
     */
    const handleCloseModal = () => {
        resetState();
    };

    /**
     * Opens the confirmation modal.
     */
    const handleConfirmUpload = () => {
        setIsConfirmModalOpen(true);
    };

    /**
     * Closes the confirmation modal.
     */
    const handleCancelUpload = () => {
        setIsConfirmModalOpen(false);
    };

    // --- CSV Parsing Logic ---

    /**
     * Parses a given CSV file using Papa Parse into an array of JavaScript objects.
     * Assumes the CSV has a header row to use as object keys.
     * @param {File} file The CSV file to parse.
     * @returns {Promise<Array<Object>>} A promise that resolves with the parsed data or rejects with errors.
     */
    const parseCsv = (file) => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true, // Crucial for converting to array of objects with headers as keys
                skipEmptyLines: true, // Ignores empty rows in the CSV
                complete: (results) => {
                    if (results.errors.length) {
                        // If Papa Parse encounters errors during parsing, reject the promise
                        reject(results.errors);
                    } else {
                        // Resolve with the parsed data (array of objects)
                        resolve(results.data);
                    }
                },
                error: (error) => {
                    // Catch any general parsing errors
                    reject(error);
                },
            });
        });
    };

    // --- Drag and Drop Handling ---

    /**
     * Callback function for react-dropzone when files are dropped.
     * Validates the file type (must be CSV) and then initiates parsing.
     * Uses useCallback to memoize the function for performance.
     * @param {Array<File>} acceptedFiles An array of files accepted by the dropzone.
     */
    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) {
            // If no files were dropped or accepted, alert the user
            alert('Please drop a CSV file.'); // Using alert for simplicity, consider custom modal
            return;
        }

        const file = acceptedFiles[0]; // Get the first accepted file
        if (file.type !== 'text/csv') {
            // Validate file type to ensure it's a CSV
            alert('Only CSV files are allowed.'); // Using alert for simplicity, consider custom modal
            return;
        }

        setFileName(file.name); // Store the name of the dropped file
        setIsFileDropped(true); // Indicate that a file has been dropped
        setUploadStatus('idle'); // Reset upload status for a new file

        setIsLoading(true); // Show loading spinner
        setLoadingMessage('Converting CSV to data...'); // Update loading message

        try {
            const data = await parseCsv(file); // Parse the CSV file
            setParsedData(data); // Store the parsed data
            setIsLoading(false); // Hide loading spinner
            setLoadingMessage(''); // Clear loading message
            // No automatic confirm modal here, relies on the "Import" button
        } catch (error) {
            console.error('Error parsing CSV:', error);
            alert('Failed to parse CSV file. Please check its format.'); // Using alert for simplicity
            setIsLoading(false); // Hide loading spinner
            setLoadingMessage(''); // Clear loading message
            resetState(); // Reset the component state if parsing fails
        }
    }, []); // Empty dependency array means this function is created once

    // Hook from react-dropzone to get props for the drop area
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // --- Data Upload Logic ---

    /**
     * Handles the actual upload of the parsed data to the specified endpoint.
     * This function is called after user confirmation.
     */
    const handleUploadData = async () => {
        if (parsedData.length === 0) {
            // If there's no data to upload, alert the user and close the modal
            alert('No data to upload. Please drop and parse a CSV file first.'); // Using alert for simplicity
            handleCloseModal();
            return;
        }

        setIsConfirmModalOpen(false); // Close the confirmation modal
        setIsLoading(true); // Show loading spinner for upload
        setLoadingMessage('Uploading data to server...'); // Update loading message
        setUploadStatus('uploading'); // Set upload status to 'uploading'
        setUploadError(null); // Clear any previous upload errors

        try {
            // Prepare payload in the expected API format.
            const requestUrl = uploadEndpoint.startsWith('http') ? uploadEndpoint : uploadEndpoint.replace(/^\/+/, '');
            const payload = { users: parsedData };
            const response = await api.post(requestUrl, payload, {
                headers: {
                    'Content-Type': 'application/json', // Indicate that the body is JSON
                },
            });

            const uploadedUsers = response.data?.data || response.data || parsedData;
            console.log('Upload successful:', uploadedUsers);

            setUploadStatus('success'); // Set status to success
            setLoadingMessage('Upload complete!'); // Update message
            if (typeof onUploadComplete === 'function') {
                onUploadComplete(uploadedUsers);
            }

            // Close the modal after a short delay to allow the user to see the success message
            setTimeout(() => {
                handleCloseModal();
            }, 2000);
        } catch (error) {
            console.error('Error uploading data:', error);
            setUploadStatus('error'); // Set status to error
            setLoadingMessage('Upload failed!'); // Update message
            // Extract a user-friendly error message
            setUploadError(error.response?.data?.message || error.message || 'Unknown upload error');
            // Keep the modal open to display the error message
        } finally {
            setIsLoading(false); // Hide loading spinner regardless of success or failure
        }
    };

    // State to hold the current numerical value of the counter.
    const [count, setCount] = useState(0);
    // Ref to store the ID of the setInterval, allowing us to clear it later.
    const intervalIdRef = useRef(null);
    // State to trigger a re-run of the useEffect, effectively resetting the counter.
    const [resetTrigger, setResetTrigger] = useState(0);

    // useEffect hook: Manages the counter's incrementing logic and lifecycle.
    useEffect(() => {
        // Clear any previously running interval to ensure a clean start or reset.
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
        }

        // Initialize the counter to 0 at the start of each animation cycle.
        setCount(0);

        const targetValue = 100; // The final value the counter will reach.
        const animationDuration = 3000; // Duration of the animation in milliseconds (4 seconds).
        const startTime = Date.now(); // Timestamp when the animation begins.

        // Set up an interval to update the counter value periodically.
        intervalIdRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime; // Time elapsed since the animation started.
            // Calculate the new count based on the elapsed time, ensuring it doesn't exceed the target.
            const newCount = Math.min(targetValue, Math.round((elapsedTime / animationDuration) * targetValue));

            setCount(newCount); // Update the state with the new count.

            // If the target value is reached, stop the interval to prevent further updates.
            if (newCount === targetValue) {
                clearInterval(intervalIdRef.current);
            }
        }, 10); // Update interval: 10ms for a smooth visual progression.

        // Cleanup function: This runs when the component unmounts or before the effect re-runs.
        return () => {
            // Ensure the interval is cleared to prevent memory leaks.
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
        };
    }, [resetTrigger]); // Dependency array: Effect re-runs when resetTrigger changes (on button click).

    // Function to handle the "Reset Counter" button click.
    const handleReset = () => {
        // Increment resetTrigger to force the useEffect to re-execute, restarting the animation.
        setResetTrigger(prev => prev + 1);
    };

    // Calculate the degree for the conic gradient to represent progress (0-100 maps to 0-360 degrees).
    const progressDegrees = (count / 100) * 360;

    // --- JSX Render ---

    return (
        <div className="font-inter"> {/* Applying Inter font */}
            {/* Button to open the CSV upload modal */}
            <button
                onClick={handleOpenModal}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium  rounded-xl hover:bg-zinc-50 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Import</span>
            </button>

            {/* Main Drag and Drop Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full text-center">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-2 border-b border-zinc-200 py-4 px-6">
                            <h2 className="text-xl font-light text-zinc-800">
                                Import Users
                            </h2>
                            {/* Close button with SVG icon */}
                            <span
                                className="cursor-pointer text-4xl"
                                onClick={handleCloseModal} // Use handleCloseModal to reset state
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-6 w-6 text-zinc-500 hover:text-zinc-700" // Added hover effect
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                    />
                                </svg>
                            </span>
                        </div>

                        {/* Conditional rendering for loading state or drag/drop area */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-8 min-h-64"> {/* Added min-h for consistent height */}
                                {/* Custom Tailwind CSS Circular Loader */}
                                <CircularLoader size={50} color="indigo-500" />
                                <p className="mt-4 text-lg text-zinc-600">{loadingMessage}</p>
                                {uploadStatus === 'error' && (
                                    <p className="mt-2 text-red-600 text-sm">{uploadError}</p>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Drag and drop area */}
                                <div
                                    {...getRootProps()}
                                    className={`flex flex-col justify-center space-x-4 rounded-2xl border-dashed border-2
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-zinc-300'}
                    items-center m-6 mt-12 mb-8 p-8 min-h-64 cursor-pointer transition-all duration-300
                  `}
                                >
                                    <input {...getInputProps()} /> {/* Hidden file input */}
                                    <UploadIcon /> {/* The new Upload Icon */}

                                    {isFileDropped ? (
                                        <>
                                            <h2 className="text-xl text-green-700 mt-4 font-semibold">File Selected:</h2>
                                            <p className="text-lg text-zinc-700 font-medium">{fileName}</p>
                                            <p className="text-sm text-zinc-500 font-thin mt-2">
                                                {parsedData.length > 0 ? `${parsedData.length} rows parsed.` : 'Parsing...'}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-xl text-green-700 mt-4 ">Drag CSV here</h2>
                                            <h2 className="text-sm text-zinc-500 font-thin pb-12">
                                                or click to browse file - 5mb
                                            </h2>
                                        </>
                                    )}
                                    {isDragActive && (
                                        <p className="mt-2 text-sm text-blue-600">Drop the file here...</p>
                                    )}
                                </div>

                                {/* Download Template Section */}
                                <div className='w-full flex justify-start px-6 flex-row items-center mb-6'>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="size-4 text-green-800"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                        />
                                    </svg>
                                    <a
                                        href="#" // Replace with actual path to your CSV template
                                        // download="template.csv"
                                        className="text-sm font-light text-green-800 px-1 hover:underline cursor-pointer"
                                    >
                                        Download template
                                    </a>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex justify-end mt-4 p-4 border-t border-zinc-200">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-6 mx-4 py-2 rounded-lg text-green-700 border border-green-700 hover:bg-zinc-100 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { handleConfirmUpload(); handleReset(); }} // Triggers confirmation modal before actual upload
                                        disabled={!isFileDropped || parsedData.length === 0 || isLoading} // Disable if no file or parsing in progress
                                        className={`px-6 py-2 rounded-lg text-white transition-colors duration-200
                      ${isFileDropped && parsedData.length > 0 && !isLoading
                                                ? 'bg-green-700 hover:bg-green-800'
                                                : 'bg-green-700/30 cursor-not-allowed'}
                    `}
                                    >
                                        Import
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Confirmation Modal (remains unchanged) */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0  flex items-center justify-center z-50 p-4">







                    <div>
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-xl  max-w-lg w-full text-center">
                                <div className="flex items-center justify-between mb-2 border-b border-zinc-200 py-4 px-6">
                                    <h2 className="text-xl font-light text-zinc-800 mb-2">
                                        Upload Users
                                    </h2>
                                    <span
                                        className="text-4xl"
                                        onClick={handleCancelUpload}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-6 w-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18 18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </span>
                                </div>
                                <div className="flex flex-col justify-center space-x-4 rounded-2xl border-dashed border-2 border-zinc-300  items-center m-6 mt-24 py-8">



                                    <div className="bg-white p-10 rounded-xl  flex flex-col items-center justify-center space-y-6">
                                        {/* Circular progress display: always rendered to show progress or final state. */}
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            {/* Background circle for the progress bar. */}
                                            <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                                            {/* Dynamic progress circle using conic-gradient for visual fill. */}
                                            <div
                                                className="absolute inset-0 rounded-full green-700"
                                                style={{
                                                    // conic-gradient fills from the top (0 degrees) clockwise.
                                                    // The green color fills up to `progressDegrees`, the rest is transparent.
                                                    background: `conic-gradient(#008236 ${progressDegrees}deg, transparent ${progressDegrees}deg)`,
                                                    // Mask creates the border effect by making the inner part transparent.
                                                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)',
                                                    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)'
                                                }}
                                            ></div>
                                            {/* Displays the current count in the center of the circle. */}
                                            <div className="absolute inset-0 flex items-center justify-center font-semibold  text-green-700">
                                                {count}%
                                            </div>
                                        </div>


                                    </div>




                                    <p className="mb-4 text-zinc-700">
                                        You are about to upload data from{' '}
                                        <span className="font-semibold">{fileName}</span>.
                                        <br />
                                        This will convert <span className="font-semibold">{parsedData.length}</span> users.
                                        {/* {parsedData.map(option => (
                                <p key={option.firstName} >{option.firstName} {option.lastName}</p>
                            ))} */}
                                    </p>
                                    <p className="mb-6 text-zinc-700">
                                        Are you sure you want to proceed?
                                    </p>





                                </div>


                                <div className="flex justify-end mt-4 p-4">
                                    <button onClick={handleCancelUpload} className="px-6 mx-4 py-2 rounded-lg text-green-700 border border-green-700 hover:bg-zinc-100">
                                        Cancel
                                    </button>
                                    <button onClick={handleUploadData} className="px-6 py-2 rounded-lg text-white bg-green-700 hover:bg-green-800">
                                        import
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            )}
        </div>
    );
};



export default CsvUploader;

