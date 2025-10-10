import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { NotebookSection, listSections, saveSection, deleteSection } from '@/lib/localStore';

interface SectionManagerProps {
  onClose?: () => void;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#64748b', // slate
];

/**
 * SectionManager Component
 * 
 * Manages notebook sections with CRUD operations:
 * - Create new sections with name and color
 * - Edit existing sections
 * - Delete sections (with confirmation)
 * - Display all sections in a list
 */
export const SectionManager: React.FC<SectionManagerProps> = ({ onClose }) => {
  const [sections, setSections] = useState<NotebookSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<NotebookSection | null>(null);
  
  // Form state for create/edit
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  // Load sections on mount
  useEffect(() => {
    loadSectionsData();
  }, []);

  const loadSectionsData = async () => {
    try {
      setLoading(true);
      const data = await listSections();
      setSections(data);
    } catch (error) {
      console.error('[SectionManager] Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;

    try {
      const newSection: NotebookSection = {
        id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formName.trim(),
        color: formColor,
        createdAt: Date.now(),
        order: sections.length,
      };

      await saveSection(newSection);
      await loadSectionsData();
      
      // Reset form
      setFormName('');
      setFormColor(PRESET_COLORS[0]);
      setIsCreating(false);
    } catch (error) {
      console.error('[SectionManager] Error creating section:', error);
    }
  };

  const handleEdit = async (section: NotebookSection) => {
    setEditingId(section.id);
    setFormName(section.name);
    setFormColor(section.color);
  };

  const handleSaveEdit = async (section: NotebookSection) => {
    if (!formName.trim()) return;

    try {
      const updatedSection: NotebookSection = {
        ...section,
        name: formName.trim(),
        color: formColor,
      };

      await saveSection(updatedSection);
      await loadSectionsData();
      
      // Reset edit state
      setEditingId(null);
      setFormName('');
      setFormColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error('[SectionManager] Error updating section:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormName('');
    setFormColor(PRESET_COLORS[0]);
  };

  const handleDeleteClick = (section: NotebookSection) => {
    setSectionToDelete(section);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;

    try {
      await deleteSection(sectionToDelete.id);
      await loadSectionsData();
      setShowDeleteDialog(false);
      setSectionToDelete(null);
    } catch (error) {
      console.error('[SectionManager] Error deleting section:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading sections...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-md">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Manage Sections</h3>
        <p className="text-sm text-muted-foreground">
          Organize your pages into color-coded sections
        </p>
      </div>

      {/* Create new section */}
      {!isCreating ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Section
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label htmlFor="section-name">Section Name</Label>
              <Input
                id="section-name"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g., Personal Expenses"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!formName.trim()}>
                <Check className="w-4 h-4 mr-1" />
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setFormName('');
                  setFormColor(PRESET_COLORS[0]);
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section list */}
      <div className="space-y-2">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No sections yet. Create one to organize your pages.
              </p>
            </CardContent>
          </Card>
        ) : (
          sections.map(section => (
            <Card key={section.id}>
              <CardContent className="p-3">
                {editingId === section.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <Input
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Section name"
                    />
                    <div className="flex gap-2">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            formColor === color ? 'border-foreground scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormColor(color)}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(section)} disabled={!formName.trim()}>
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: section.color }}
                      />
                      <span className="font-medium">{section.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(section)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(section)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Close button */}
      {onClose && (
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{sectionToDelete?.name}"? This action cannot be
              undone. Pages in this section will not be deleted, but will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SectionManager;

