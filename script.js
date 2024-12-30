const loadPdf = async (url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await PDFLib.PDFDocument.load(arrayBuffer);
};
document.addEventListener('DOMContentLoaded', () => {
    const dropzoneLabel = document.getElementById('dropzone-label');
    const dropzoneFileInput = document.getElementById('dropzone-file');

    dropzoneLabel.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzoneLabel.classList.add('bg-gray-300', 'border-blue-500');
    });

    dropzoneLabel.addEventListener('dragleave', () => {
        dropzoneLabel.classList.remove('bg-gray-300', 'border-blue-500');
    });

    dropzoneLabel.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzoneLabel.classList.remove('bg-gray-300', 'border-blue-500');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            dropzoneFileInput.files = files;
            // Trigger change event to handle the file upload
            const changeEvent = new Event('change');
            dropzoneFileInput.dispatchEvent(changeEvent);
        }
    });
});
document.getElementById('dropzone-file').addEventListener('change', async function(event) {
    try {
        const fileInput = event.target;
        const file = fileInput.files[0];
        if (file) {
            console.log('File selected:', file.name);
            const arrayBuffer = await file.arrayBuffer();
            console.log('Array buffer loaded');
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            console.log('PDF loaded');
            const numPages = pdfDoc.getPageCount();
            const residual = numPages % 4;

            console.log(`Number of pages: ${numPages}`);
            console.log(`Residual when divided by 4: ${residual}`);

            const firstPage = pdfDoc.getPage(0);
            const secondPage = pdfDoc.getPage(1);
            const penultimatePage = pdfDoc.getPage(numPages - 2);
            const lastPage = pdfDoc.getPage(numPages - 1);
            const { width, height } = firstPage.getSize();

            // Create a new PDFDocument
            const newPdfDoc = await PDFLib.PDFDocument.create();
            // Add a new page to the new PDFDocument
            const newFirstPage = newPdfDoc.addPage([width * 2, height * 2]);

            const embedAndDrawPage = async (pdfDoc, newPdfDoc, pageIndex, x, y, width, height) => {
                const embeddedPage = await newPdfDoc.embedPage(pdfDoc.getPage(pageIndex));
                return { embeddedPage, x, y, width, height };
            };

            const drawPagesOnNewPage = (newPage, pages) => {
                pages.forEach(page => {
                    newPage.drawPage(page.embeddedPage, {
                        x: page.x,
                        y: page.y,
                        width: page.width,
                        height: page.height,
                    });
                });
            };

            if (residual === 1) {
                const embeddedPage = await newPdfDoc.embedPage(firstPage);
                newFirstPage.drawPage(embeddedPage, {
                    x: width,
                    y: height,
                    width: width,
                    height: height,
                });
                newFirstPage.drawPage(embeddedPage, {
                    x: width,
                    y: 0,
                    width: width,
                    height: height,
                });
                const qrPdfDoc = await loadPdf('qr.pdf');
                const [qrPage] = await newPdfDoc.copyPages(qrPdfDoc, [0]);
                const embeddedQrPage = await newPdfDoc.embedPage(qrPage);
                newFirstPage.drawPage(embeddedQrPage, {
                    x: 0,
                    y: height,
                    width: width,
                    height: height,
                });
                newFirstPage.drawPage(embeddedQrPage, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
                newPdfDoc.addPage([width * 2, height * 2]);

                if (numPages > 1) {
                    i = 1;
                    n = numPages - 1;

                    while (i < n / 2) {
                        const newFrontPage = newPdfDoc.addPage([width * 2, height * 2]);
                        const frontPages = [
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n + 1 - i, 0, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i, width, height, width, height),                                  
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n + 1 - i, 0, 0, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i, width, 0, width, height),
                        ];
                        drawPagesOnNewPage(newFrontPage, frontPages);

                        const newBackPage = newPdfDoc.addPage([width * 2, height * 2]);
                        const backPages = [
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 1, 0, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - i, width, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 1, 0, 0, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - i, width, 0, width, height),
                        ];
                        drawPagesOnNewPage(newBackPage, backPages);

                        i += 2;
                    }
                }
            } else if (residual === 2) {
                const embeddedPage1 = await newPdfDoc.embedPage(firstPage);
                newFirstPage.drawPage(embeddedPage1, {
                    x: width,
                    y: height,
                    width: width,
                    height: height,
                });
                newFirstPage.drawPage(embeddedPage1, {
                    x: width,
                    y: 0,
                    width: width,
                    height: height,
                });
                const qrPdfDoc = await loadPdf('qr.pdf');
                const [qrPage] = await newPdfDoc.copyPages(qrPdfDoc, [0]);
                const embeddedQrPage = await newPdfDoc.embedPage(qrPage);
                newFirstPage.drawPage(embeddedQrPage, {
                    x: 0,
                    y: height,
                    width: width,
                    height: height,
                });
                newFirstPage.drawPage(embeddedQrPage, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
                const embeddedPage2 = await newPdfDoc.embedPage(lastPage);
                const newSecondPage = newPdfDoc.addPage([width * 2, height * 2]);
                newSecondPage.drawPage(embeddedPage2, {
                    x: width,
                    y: height,
                    width: width,
                    height: height,
                });
                newSecondPage.drawPage(embeddedPage2, {
                    x: width,
                    y: 0,
                    width: width,
                    height: height,
                });
                if (numPages > 2) {
                    i = 1;
                    n = numPages - 1;

                    while (i < n / 2) {
                        const newFrontPage = newPdfDoc.addPage([width * 2, height * 2]);
                        const frontPages = [
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - i, 0, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i, width, height, width, height),                                  
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - i, 0, 0, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i, width, 0, width, height),
                        ];
                        drawPagesOnNewPage(newFrontPage, frontPages);

                        const newBackPage = newPdfDoc.addPage([width * 2, height * 2]);
                        const backPages = [
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 1, 0, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - 1 - i, width, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 1, 0, 0, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - 1 - i, width, 0, width, height),
                        ];
                        drawPagesOnNewPage(newBackPage, backPages);

                        i += 2;
                    }
                }
            } else if (residual === 3) {
                const embeddedPage1 = await newPdfDoc.embedPage(firstPage);
                newFirstPage.drawPage(embeddedPage1, {
                    x: width,
                    y: height,
                    width: width,
                    height: height,
                });
                newFirstPage.drawPage(embeddedPage1, {
                    x: width,
                    y: 0,
                    width: width,
                    height: height,
                });
                const qrPdfDoc = await loadPdf('qr.pdf');
                const [qrPage] = await newPdfDoc.copyPages(qrPdfDoc, [0]);
                const embeddedQrPage = await newPdfDoc.embedPage(qrPage);
                newFirstPage.drawPage(embeddedQrPage, {
                    x: 0,
                    y: height,
                    width: width,
                    height: height,
                });
                newFirstPage.drawPage(embeddedQrPage, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
                const embeddedPage2 = await newPdfDoc.embedPage(secondPage);
                const newSecondPage = newPdfDoc.addPage([width * 2, height * 2]);
                newSecondPage.drawPage(embeddedPage2, {
                    x: 0,
                    y: height,
                    width: width,
                    height: height,
                });
                newSecondPage.drawPage(embeddedPage2, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
                const embeddedPage3 = await newPdfDoc.embedPage(lastPage);
                newSecondPage.drawPage(embeddedPage3, {
                    x: width,
                    y: height,
                    width: width,
                    height: height,
                });
                newSecondPage.drawPage(embeddedPage3, {
                    x: width,
                    y: 0,
                    width: width,
                    height: height,
                });
                if (numPages > 1) {
                    i = 1;
                    n = numPages - 1;

                    while (i < n / 2) {
                        const newFrontPage = newPdfDoc.addPage([width * 2, height * 2]);
                        const frontPages = [
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - i, 0, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 1, width, height, width, height),                                  
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - i, 0, 0, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 1, width, 0, width, height),
                        ];
                        drawPagesOnNewPage(newFrontPage, frontPages);

                        const newBackPage = newPdfDoc.addPage([width * 2, height * 2]);
                        const backPages = [
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 2, 0, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - 1 - i, width, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 2, 0, 0, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - 1 - i, width, 0, width, height),
                        ];
                        drawPagesOnNewPage(newBackPage, backPages);

                        i += 2;
                    }
                }
            } else if (residual === 0) {
                const embeddedPage1 = await newPdfDoc.embedPage(firstPage);
                newFirstPage.drawPage(embeddedPage1, {
                    x: width,
                    y: height,
                    width: width,
                    height: height,
                });
                newFirstPage.drawPage(embeddedPage1, {
                    x: width,
                    y: 0,
                    width: width,
                    height: height,
                });
                const embeddedPage2 = await newPdfDoc.embedPage(lastPage); // Embed the last page
                newFirstPage.drawPage(embeddedPage2, {
                    x: 0,
                    y: height,
                    width: width,
                    height: height,
                });
                newFirstPage.drawPage(embeddedPage2, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
                const embeddedPage3 = await newPdfDoc.embedPage(secondPage); // Embed the second page

                // Calculate the center position for the text
                const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Courier);
                const text = 'CREA y DESCARGA libritos en libritos.arias.pw';
                const fontSize = 20;
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                const textHeight = fontSize;
                const centerX = (newFirstPage.getWidth() - (textHeight)) / 2;
                const centerY = ((newFirstPage.getHeight() / 2) + (textWidth / 3));

                newFirstPage.drawText(text, {
                    x: centerX,
                    y: centerY,
                    size: fontSize,
                    font: font,
                    color: PDFLib.rgb(0, 0, 0), // Black color
                    rotate: PDFLib.degrees(90),
                });
                const newCenterY = (textWidth / 3);
                newFirstPage.drawText(text, {
                    x: centerX,
                    y: newCenterY,
                    size: fontSize,
                    font: font,
                    color: PDFLib.rgb(0, 0, 0), // Black color
                    rotate: PDFLib.degrees(90),
                });

                const newSecondPage = newPdfDoc.addPage([width * 2, height * 2]); // Add a new page
                newSecondPage.drawPage(embeddedPage3, {
                    x: 0,
                    y: height,
                    width: width,
                    height: height,
                });
                newSecondPage.drawPage(embeddedPage3, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
                const embeddedPage4 = await newPdfDoc.embedPage(penultimatePage); // Embed the penultimate page
                newSecondPage.drawPage(embeddedPage4, {
                    x: width,
                    y: height,
                    width: width,
                    height: height,
                });
                newSecondPage.drawPage(embeddedPage4, {
                    x: width,
                    y: 0,
                    width: width,
                    height: height,
                });
                if (numPages > 4) {
                    i = 1;
                    n = numPages - 2;

                    while (i < n / 2) {
                        const newFrontPage = newPdfDoc.addPage([width * 2, height * 2]);
                        const frontPages = [
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - i, 0, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 1, width, height, width, height),                                  
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - i, 0, 0, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 1, width, 0, width, height),
                        ];
                        drawPagesOnNewPage(newFrontPage, frontPages);

                        const newBackPage = newPdfDoc.addPage([width * 2, height * 2]);
                        const backPages = [
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 2, 0, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - 1 - i, width, height, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, i + 2, 0, 0, width, height),
                            await embedAndDrawPage(pdfDoc, newPdfDoc, n - 1 - i, width, 0, width, height),
                        ];
                        drawPagesOnNewPage(newBackPage, backPages);

                        i += 2;
                    }
                }
            }

            const pdfBytes = await newPdfDoc.save();
            console.log('PDF saved');

            const uploadText = document.getElementById('uploadText');
            uploadText.innerText = `${file.name}`;
            uploadText.classList.remove('text-gray-700');
            uploadText.classList.add('text-blue-500');
            const uploadMax = document.getElementById('uploadMax');
            uploadMax.innerText = 'Para cambiar da click o arrastra un nuevo archivo.';

            const downloadButton = document.getElementById('downloadButton');
            const spinnerButton = document.createElement('button');
            spinnerButton.disabled = true;
            spinnerButton.type = 'button';
            spinnerButton.className = 'btn btn-primary bg-blue-300 text-white text-xl px-8 py-2 rounded cursor-not-allowed font-bold';
            spinnerButton.innerHTML = `
                <svg aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                </svg>
                Cargando...
            `;
            
            downloadButton.parentNode.replaceChild(spinnerButton, downloadButton);
            
            setTimeout(() => {
                spinnerButton.parentNode.replaceChild(downloadButton, spinnerButton);
                downloadButton.disabled = false;
                downloadButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
                downloadButton.classList.add('bg-blue-500', 'hover:bg-blue-700');
                downloadButton.style.display = 'block';
                downloadButton.onclick = () => {
                    const originalFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
                    const newFileName = `${originalFileName} - (libritos.arias.pw).pdf`;
                    download(pdfBytes, newFileName, 'application/pdf');
                };
            }, 4000);

            // Change the upload icon to a PDF icon
            const uploadIcon = document.getElementById('upload-icon');
            uploadIcon.innerHTML = `
                <svg id="upload-icon" class="w-14 h-14 mb-6 text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 17V2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M5 15V1m8 18v-4"/>
                </svg>
            `;

            console.log('Download button updated');

        }
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
});