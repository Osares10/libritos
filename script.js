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
            downloadButton.disabled = false;
            downloadButton.classList.remove('bg-gray-500', 'cursor-not-allowed');
            downloadButton.classList.add('bg-blue-500', 'hover:bg-blue-700');
            downloadButton.style.display = 'block';
            downloadButton.onclick = () => {
                const originalFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
                const newFileName = `${originalFileName} - (libritos.arias.pw) .pdf`;
                download(pdfBytes, newFileName, 'application/pdf');
            };

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