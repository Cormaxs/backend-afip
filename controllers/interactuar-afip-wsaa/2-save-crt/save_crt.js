import fs from 'fs/promises'; // Use fs/promises for async/await
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function saveCrt(req, res) {
    const { certificateContent, id } = req.body;

    // 1. Validate incoming data
    if (!certificateContent || !id) {
        return res.status(400).send({
            success: false,
            message: 'Missing required parameters: "certificateContent" and/or "id".'
        });
    }

    // Define the directory where the certificate is expected to be saved
    const userAfipDir = path.join(__dirname, `${process.env.RAIZ_USERS}${id}/afip`);
    
    // Define the full path for the certificate file
    const certificateFilePath = path.join(userAfipDir, 'certificado.crt');

    try {
        // 2. Write the certificate content to the file
        // No fs.mkdir() call here as the directory is guaranteed to exist.
        await fs.writeFile(certificateFilePath, certificateContent);
        console.log(`Certificate saved successfully to: ${certificateFilePath}`);

        // 3. Send success response
        return res.status(200).send({
            success: true,
            message: 'Certificate saved successfully.',
            path: certificateFilePath
        });

    } catch (error) {
        console.error(`Error saving certificate to ${certificateFilePath}:`, error);
        
        // 4. Handle specific file system errors
        if (error.code === 'ENOENT') {
            // ENOENT means "Error NO ENTry", typically file or directory not found
            return res.status(404).send({
                success: false,
                message: `Target directory not found: ${userAfipDir}. Please ensure it exists before saving the certificate.`,
                errorDetails: error.message
            });
        } else if (error.code === 'EACCES') {
            // EACCES means "Permission denied"
            return res.status(403).send({
                success: false,
                message: `Permission denied: Unable to write to ${certificateFilePath}. Check file permissions.`,
                errorDetails: error.message
            });
        } else {
            // Catch-all for other unexpected errors during file writing
            return res.status(500).send({
                success: false,
                message: 'An unexpected error occurred while saving the certificate.',
                errorDetails: error.message
            });
        }
    }
}