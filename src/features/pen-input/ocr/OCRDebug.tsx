import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bug, Download, Trash2, RefreshCw, Search, Calendar, Hash, Eye } from 'lucide-react';
import { loadOCRTelemetry, deleteOCRTelemetry, clearOldTelemetry } from '@/lib/localStore';
import type { OCRTelemetry } from '@/lib/localStore';
import { toast } from 'sonner';

export function OCRDebug() {
  const [telemetry, setTelemetry] = useState<OCRTelemetry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<OCRTelemetry | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await loadOCRTelemetry();
      setTelemetry(data);
    } catch (error) {
      toast.error('Failed to load OCR telemetry');
      console.error('Error loading telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTelemetry = telemetry.filter(entry =>
    entry.recognizedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.imageHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.correctedText && entry.correctedText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteOCRTelemetry(id);
      await loadData();
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const handleClearOld = async () => {
    try {
      await clearOldTelemetry(30); // Clear entries older than 30 days
      await loadData();
      toast.success('Old entries cleared');
    } catch (error) {
      toast.error('Failed to clear old entries');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(telemetry, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-telemetry-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Telemetry exported');
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength = 50): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bug className="w-8 h-8 text-red-500" />
              OCR Debug Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              View and analyze OCR recognition telemetry data
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} disabled={loading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleClearOld} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Old
            </Button>
          </div>
        </div>
      </Card>

      {/* Search and Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search telemetry entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total entries: {telemetry.length}</span>
            <span>Filtered: {filteredTelemetry.length}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">{telemetry.length}</div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {telemetry.length > 0 ? Math.round(
                telemetry.reduce((sum, entry) => sum + entry.confidence, 0) / telemetry.length * 100
              ) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {telemetry.filter(e => e.correctedText).length}
            </div>
            <div className="text-sm text-muted-foreground">Corrected</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {new Set(telemetry.map(e => e.imageHash)).size}
            </div>
            <div className="text-sm text-muted-foreground">Unique Images</div>
          </Card>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry List */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Telemetry Entries</h2>
          </div>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Image Hash</TableHead>
                  <TableHead>Recognized Text</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTelemetry.map((entry, index) => (
                  <TableRow key={index} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(entry.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <code className="text-xs">{entry.imageHash.substring(0, 8)}...</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {truncateText(entry.recognizedText)}
                        {entry.correctedText && (
                          <Badge variant="secondary" className="ml-2 text-xs">Corrected</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getConfidenceColor(entry.confidence)}>
                        {Math.round(entry.confidence * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Entry Details */}
        <Card>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Entry Details</h2>
          </div>
          <div className="p-4">
            {selectedEntry ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm">{formatDate(selectedEntry.timestamp)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Image Hash</Label>
                  <code className="text-xs break-all">{selectedEntry.imageHash}</code>
                </div>
                <div>
                  <Label className="text-sm font-medium">Confidence</Label>
                  <Badge className={getConfidenceColor(selectedEntry.confidence)}>
                    {Math.round(selectedEntry.confidence * 100)}%
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Recognized Text</Label>
                  <p className="text-sm bg-muted p-2 rounded break-words">
                    {selectedEntry.recognizedText}
                  </p>
                </div>
                {selectedEntry.correctedText && (
                  <div>
                    <Label className="text-sm font-medium">Corrected Text</Label>
                    <p className="text-sm bg-green-50 p-2 rounded break-words">
                      {selectedEntry.correctedText}
                    </p>
                  </div>
                )}
                {selectedEntry.fields && (
                  <div>
                    <Label className="text-sm font-medium">Parsed Fields</Label>
                    <div className="space-y-2">
                      {Object.entries(selectedEntry.fields).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Select an entry to view details
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default OCRDebug;
