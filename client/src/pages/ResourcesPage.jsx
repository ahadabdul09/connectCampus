import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Upload,
  Download,
  FileText,
  FileArchive,
  FileCode,
  Tag,
  Filter,
  Plus,
} from 'lucide-react';
import { resourceService } from '../services/resourceService.js';
import { communityService } from '../services/communityService.js';
import { RESOURCE_CATEGORIES } from '../constants/index.js';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { Input } from '../components/Input.jsx';
import { formatDate } from '../utils/formatDate.js';
import { formatFileSize } from '../utils/formatFileSize.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { cn } from '../utils/cn.js';

export function ResourcesPage() {
  usePageTitle('Resources');
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, downloads
  const [isLoading, setIsLoading] = useState(true);

  // Upload Resource Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'ACADEMICS',
    departmentId: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadResources() {
      setIsLoading(true);
      try {
        const [res, depts] = await Promise.all([
          resourceService.getResources({
            category: activeCategory,
            departmentId: selectedDept || undefined,
            search: searchQuery || undefined,
            sortBy,
          }),
          communityService.getDepartments(),
        ]);
        setResources(res);
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadResources();
  }, [activeCategory, selectedDept, searchQuery, sortBy]);

  const handleDownload = async (resource) => {
    try {
      await resourceService.recordDownload(resource.id);
      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id ? { ...r, downloadsCount: r.downloadsCount + 1 } : r
        )
      );
      window.open(resource.fileUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadData.title.trim()) {
      alert('Please provide a title and select a file to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      if (uploadData.departmentId) {
        formData.append('departmentId', uploadData.departmentId);
      }
      if (uploadData.tags) {
        formData.append('tags', uploadData.tags);
      }
      formData.append('file', selectedFile);

      await resourceService.uploadResource(formData);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadData({
        title: '',
        description: '',
        category: 'ACADEMICS',
        departmentId: '',
        tags: '',
      });

      const updated = await resourceService.getResources({
        category: activeCategory,
        sortBy,
      });
      setResources(updated);
    } catch (err) {
      alert(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toUpperCase()) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-campus-accent" />;
      case 'ZIP':
        return <FileArchive className="w-5 h-5 text-campus-primary" />;
      default:
        return <FileCode className="w-5 h-5 text-campus-text-secondary" />;
    }
  };

  return (
    <div className="py-6 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-campus-border gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-campus-text-primary font-bold tracking-tight">
            Academic & Placement Resource Library
          </h1>
          <p className="text-xs text-campus-text-secondary mt-1">
            Verified lecture notes, syllabus question banks, laboratory code manuals, and capstone templates.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="w-3.5 h-3.5" />
          Share Resource
        </Button>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium border-b border-campus-border/60">
        {RESOURCE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-3.5 py-2 rounded-t-btn border-b-2 transition-colors whitespace-nowrap',
              activeCategory === cat.id
                ? 'border-campus-primary text-campus-primary font-bold bg-campus-primary-light/40'
                : 'border-transparent text-campus-text-secondary hover:text-campus-text-primary'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-campus-secondary/30 rounded-card border border-campus-border text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-campus-text-muted" />
          <input
            type="text"
            placeholder="Search notes, tags, or document titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-campus-surface border border-campus-border rounded-input text-xs text-campus-text-primary placeholder:text-campus-text-muted focus:outline-none focus:border-campus-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-campus-text-secondary">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-campus-surface border border-campus-border rounded px-2.5 py-1 text-campus-text-primary focus:outline-none"
            >
              <option value="">All Branches</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-campus-text-secondary">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-campus-surface border border-campus-border rounded px-2.5 py-1 text-campus-text-primary focus:outline-none"
            >
              <option value="recent">Recently Uploaded</option>
              <option value="downloads">Most Downloaded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-campus-text-secondary border border-dashed border-campus-border rounded-container bg-campus-surface">
            No resources found for the selected category and filter criteria.
          </div>
        ) : (
          resources.map((res) => (
            <div
              key={res.id}
              className="bg-campus-surface border border-campus-border rounded-container p-5 shadow-subtle flex flex-col justify-between hover:border-campus-primary/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded bg-campus-secondary shrink-0">
                    {getFileIcon(res.fileType)}
                  </div>
                  <Badge variant="neutral">{res.category}</Badge>
                </div>

                <h3 className="font-serif font-bold text-base text-campus-text-primary leading-snug line-clamp-2 mb-2">
                  {res.title}
                </h3>

                <p className="text-xs text-campus-text-secondary leading-relaxed line-clamp-3 mb-4">
                  {res.description || 'Verified course document and reference manual.'}
                </p>

                {res.tags && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {res.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-campus-secondary/80 text-campus-text-secondary font-medium"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-campus-border/60">
                <div className="flex items-center justify-between text-[11px] text-campus-text-muted mb-3">
                  <span>{formatFileSize(res.fileSize)}</span>
                  <span>{res.downloadsCount} downloads</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-campus-text-secondary truncate max-w-[150px]">
                    by {res.uploader?.fullName}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(res)}
                    className="gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Share Resource */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Academic Document"
        description="Contribute verified study guides, syllabus problem sets, or capstone templates."
      >
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
          <Input
            label="Resource Title"
            placeholder="e.g. Computer Networks Socket Programming Lab Guide"
            value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                Category
              </label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                className="w-full bg-campus-surface border border-campus-border rounded-input px-3 py-2 text-xs text-campus-text-primary focus:border-campus-primary focus:outline-none"
              >
                <option value="ACADEMICS">Academics & Syllabus</option>
                <option value="PLACEMENT">Placement & Career</option>
                <option value="PROJECTS">Projects & Lab Works</option>
                <option value="NOTES">Notes & Study Guides</option>
                <option value="EVENTS">Events & Handouts</option>
                <option value="CLUBS">Club Publications</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                Department
              </label>
              <select
                value={uploadData.departmentId}
                onChange={(e) =>
                  setUploadData({ ...uploadData, departmentId: e.target.value })
                }
                className="w-full bg-campus-surface border border-campus-border rounded-input px-3 py-2 text-xs text-campus-text-primary focus:border-campus-primary focus:outline-none"
              >
                <option value="">Campus Wide</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Tags (Comma-separated)"
            placeholder="e.g. ISE, Semester5, Networks, TCP"
            value={uploadData.tags}
            onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
              Summary Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide a short description of the contents and course relevance..."
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="w-full bg-campus-surface border border-campus-border rounded-input p-3 text-xs text-campus-text-primary focus:border-campus-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
              Select Document File (PDF, ZIP, Word, Max 25MB)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-btn file:border-0 file:text-xs file:font-semibold file:bg-campus-secondary file:text-campus-text-primary hover:file:bg-[#E4E2DC] cursor-pointer"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isUploading}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
