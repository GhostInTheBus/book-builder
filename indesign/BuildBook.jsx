/**
 * Book-Builder -> InDesign Importer v2.0
 * Optimized for: Page Overrides & Theoretical Anchors
 */

function main() {
    var jsonFile = File.openDialog("Select the Book-Builder JSON export", "*.json");
    if (!jsonFile) return;

    jsonFile.open("r");
    var jsonString = jsonFile.read();
    jsonFile.close();

    var data;
    try {
        data = JSON.parse(jsonString);
    } catch(e) {
        data = eval("(" + jsonString + ")");
    }

    if (!data) {
        alert("CRITICAL: Failed to parse JSON.");
        return;
    }

    var rootFolder = Folder.selectDialog("Select the root folder where your high-res photos are stored");
    if (!rootFolder) return;

    // --- Document Setup ---
    // Note: We use the first page as the master dimension reference
    // In a future update, we can handle mixed dimensions if needed.
    var doc = app.documents.add();
    doc.documentPreferences.facingPages = true;
    doc.documentPreferences.pagesPerDocument = data.bookMetadata.totalPages;
    
    // --- Layout Build ---
    for (var i = 0; i < data.pages.length; i++) {
        var pageData = data.pages[i];
        var page = doc.pages.item(i);
        
        // Loop through slots on this specific page
        for (var j = 0; j < pageData.slots.length; j++) {
            var slot = pageData.slots[j];
            
            // Calculate Absolute Coordinates
            var pw = doc.documentPreferences.pageWidth;
            var ph = doc.documentPreferences.pageHeight;
            
            var y1 = slot.y * ph;
            var x1 = slot.x * pw;
            var y2 = (slot.y + slot.height) * ph;
            var x2 = (slot.x + slot.width) * pw;

            if (slot.type === "image") {
                // --- IMAGE HANDLING ---
                var rect = page.rectangles.add({
                    geometricBounds: [y1, x1, y2, x2],
                    strokeWeight: 0,
                    fillColor: "None"
                });

                if (slot.imagePath !== "") {
                    var imgFile = new File(rootFolder.fsName + "/" + slot.imagePath);
                    if (!imgFile.exists) {
                        // Fallback: try just the filename in the root
                        imgFile = new File(rootFolder.fsName + "/" + slot.filename);
                    }

                    if (imgFile.exists) {
                        rect.place(imgFile);
                        rect.fit(FitOptions.PROPORTIONAL_FILL);
                        rect.fit(FitOptions.CENTER_CONTENT);
                    } else {
                        // Mark missing images clearly
                        rect.fillColor = "Black";
                        rect.fillOpacity = 10;
                        var missingTxt = page.textFrames.add({
                            geometricBounds: [y1 + 5, x1 + 5, y2 - 5, x2 - 5],
                            contents: "MISSING IMAGE:\n" + slot.filename
                        });
                    }
                }
            } else if (slot.type === "text") {
                // --- THEORETICAL ANCHOR HANDLING ---
                var textFrame = page.textFrames.add({
                    geometricBounds: [y1, x1, y2, x2]
                });
                
                if (slot.textContent !== "") {
                    textFrame.contents = slot.textContent;
                    
                    // Attempt basic fine-art styling
                    try {
                        textFrame.parentStory.texts.item(0).fontStyle = "Italic";
                        textFrame.parentStory.texts.item(0).pointSize = 12;
                        textFrame.parentStory.texts.item(0).justification = Justification.CENTER_ALIGN;
                    } catch(e) {
                        // If specific fonts aren't available, InDesign will use defaults
                    }
                }
            }
        }
    }

    alert("BUILD COMPLETE\nGenerated " + data.pages.length + " pages based on the '" + data.bookMetadata.globalTemplateId + "' sequence.");
}

main();
