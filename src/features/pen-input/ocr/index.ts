/**
 * OCR Test Module
 * 
 * Exports test suite and validation dashboard for OCR accuracy testing.
 */

export { default as runAllOCRTests, runOCRAccuracyTests, testAdaptiveLearning, benchmarkOCRPerformance } from './__tests__/ocr-accuracy-test';
export { default as OCRTestDashboard } from './components/OCRTestDashboard';
export { default as OCR_VALIDATION_REPORT } from './OCR_VALIDATION_REPORT.md';

