// Simulates PDF/Invoice data extraction
// In production, this would use OCR APIs like Tesseract, AWS Textract, or Google Vision

export interface ExtractedItem {
  name: string;
  quantity: number;
  price: number;
  category: string;
}

export interface ExtractedDocument {
  id: string;
  filename: string;
  merchant: string;
  date: string;
  total: number;
  items: ExtractedItem[];
  uploadedAt: Date;
}

export function extractDocumentData(file: File): Promise<ExtractedDocument> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Generate realistic mock invoice data
      const mockDocuments = [
        {
          merchant: "Whole Foods Market",
          items: [
            { name: "Organic Bananas", quantity: 2, price: 4.98, category: "Groceries" },
            { name: "Almond Milk", quantity: 1, price: 5.99, category: "Groceries" },
            { name: "Chicken Breast", quantity: 3, price: 18.75, category: "Groceries" },
            { name: "Fresh Spinach", quantity: 2, price: 7.98, category: "Groceries" },
            { name: "Greek Yogurt", quantity: 4, price: 12.00, category: "Groceries" },
          ],
        },
        {
          merchant: "Target",
          items: [
            { name: "Laundry Detergent", quantity: 1, price: 15.99, category: "Household" },
            { name: "Paper Towels", quantity: 2, price: 24.98, category: "Household" },
            { name: "Notebook", quantity: 3, price: 11.97, category: "Office Supplies" },
            { name: "USB Cable", quantity: 1, price: 12.99, category: "Electronics" },
          ],
        },
        {
          merchant: "Amazon",
          items: [
            { name: "Wireless Mouse", quantity: 1, price: 29.99, category: "Electronics" },
            { name: "Phone Case", quantity: 1, price: 19.99, category: "Electronics" },
            { name: "HDMI Cable", quantity: 2, price: 25.98, category: "Electronics" },
            { name: "Book: AI Fundamentals", quantity: 1, price: 34.99, category: "Books" },
          ],
        },
        {
          merchant: "Shell Gas Station",
          items: [
            { name: "Premium Gasoline", quantity: 12, price: 45.20, category: "Transportation" },
            { name: "Car Wash", quantity: 1, price: 8.99, category: "Transportation" },
          ],
        },
        {
          merchant: "Starbucks",
          items: [
            { name: "Caffe Latte", quantity: 2, price: 9.50, category: "Dining" },
            { name: "Blueberry Muffin", quantity: 1, price: 3.75, category: "Dining" },
          ],
        },
      ];

      const selectedDoc = mockDocuments[Math.floor(Math.random() * mockDocuments.length)];
      const total = selectedDoc.items.reduce((sum, item) => sum + item.price, 0);

      const extractedDoc: ExtractedDocument = {
        id: Date.now().toString(),
        filename: file.name,
        merchant: selectedDoc.merchant,
        date: new Date().toLocaleDateString(),
        total: total,
        items: selectedDoc.items,
        uploadedAt: new Date(),
      };

      resolve(extractedDoc);
    }, 1500);
  });
}

export function analyzeSpendingByCategory(documents: ExtractedDocument[]): Record<string, number> {
  const categoryTotals: Record<string, number> = {};

  documents.forEach((doc) => {
    doc.items.forEach((item) => {
      if (categoryTotals[item.category]) {
        categoryTotals[item.category] += item.price;
      } else {
        categoryTotals[item.category] = item.price;
      }
    });
  });

  return categoryTotals;
}

export function findItemsByName(documents: ExtractedDocument[], searchTerm: string): ExtractedItem[] {
  const results: ExtractedItem[] = [];
  
  documents.forEach((doc) => {
    doc.items.forEach((item) => {
      if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push(item);
      }
    });
  });

  return results;
}

export function calculateAverageSpending(documents: ExtractedDocument[]): number {
  if (documents.length === 0) return 0;
  const total = documents.reduce((sum, doc) => sum + doc.total, 0);
  return total / documents.length;
}
