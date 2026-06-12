import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Upload, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import '../styles/ListItem.css';

const CATEGORIES = ['Electronics', 'Furniture', 'Vehicles', 'Books', 'Clothes', 'Agricultural Tools', 'Other'];
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Old'];
const BIHAR_DISTRICTS = [
  'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Nalanda',
  'Munger', 'Saharsa', 'Purnea', 'Saran', 'Sitamarhi', 'Vaishali',
  'Begusarai', 'Ara', 'Motihari', 'Hajipur', 'Chapra', 'Siwan', 'Gopalganj',
  'Bettiah', 'Samastipur', 'Madhubani', 'Supaul', 'Araria', 'Kishanganj',
  'Katihar', 'Sheikhpura', 'Lakhisarai', 'Jamui', 'Banka', 'Nawada',
  'Aurangabad', 'Rohtas', 'Kaimur', 'Jehanabad', 'Arwal', 'Sheohar'
];

export default function ListItem() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '', condition: '',
    location: user?.district || '',
  });
  const [images, setImages] = useState([]); // base64 or URLs
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.description.trim() || form.description.length < 20) errs.description = 'Description must be at least 20 characters.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Enter a valid price.';
    if (!form.category) errs.category = 'Select a category.';
    if (!form.condition) errs.condition = 'Select item condition.';
    if (!form.location) errs.location = 'Select your district.';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      toast.error('You can upload up to 4 images.');
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target.result]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const uploadImagesToBackend = async () => {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
    
    const res = await api.post('/api/items/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        setUploading(true);
        imageUrls = await uploadImagesToBackend();
        setUploading(false);
      }

      const res = await api.post('/api/items', {
        ...form,
        price: parseFloat(form.price),
        images: imageUrls,
      });

      toast.success('🎉 Item listed successfully!');
      navigate(`/item/${res.data.item.id}`);
    } catch (err) {
      setUploading(false);
      const msg = err.response?.data?.error || err.message || 'Failed to post item.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-item-page">
      <div className="container">
        <div className="list-item-header">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 className="section-title">Post a New Item</h1>
            <p className="section-subtitle">Fill in the details to list your item for sale.</p>
          </div>
        </div>

        <div className="list-item-grid">
          {/* Form */}
          <form className="list-item-form" onSubmit={handleSubmit} noValidate>
            {/* Basic Details */}
            <div className="form-card">
              <h3 className="form-card-title"><Package size={18} /> Item Details</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="title">Item Title</label>
                <input id="title" name="title" type="text" className="form-input"
                  placeholder='e.g. "Samsung Galaxy A12 — Good Condition"'
                  value={form.title} onChange={handleChange} />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea id="description" name="description" className="form-textarea"
                  placeholder="Describe the item — age, defects, reason for selling, usage history..."
                  value={form.description} onChange={handleChange} rows={5} />
                <span className="form-hint">{form.description.length} chars · Minimum 20</span>
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="price">Price (₹)</label>
                  <input id="price" name="price" type="number" className="form-input"
                    placeholder="e.g. 2500" value={form.price} onChange={handleChange} min={1} />
                  {errors.price && <span className="form-error">{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="condition">Condition</label>
                  <select id="condition" name="condition" className="form-select"
                    value={form.condition} onChange={handleChange}>
                    <option value="">— Select condition —</option>
                    {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {errors.condition && <span className="form-error">{errors.condition}</span>}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <select id="category" name="category" className="form-select"
                    value={form.category} onChange={handleChange}>
                    <option value="">— Select category —</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <span className="form-error">{errors.category}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Your District</label>
                  <select id="location" name="location" className="form-select"
                    value={form.location} onChange={handleChange}>
                    <option value="">— Select district —</option>
                    {BIHAR_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  {errors.location && <span className="form-error">{errors.location}</span>}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-card">
              <h3 className="form-card-title"><Upload size={18} /> Photos (Optional, up to 4)</h3>

              <div className="image-upload-area">
                {images.map((src, idx) => (
                  <div key={idx} className="image-preview">
                    <img src={src} alt={`Preview ${idx}`} />
                    <button type="button" className="image-remove-btn" onClick={() => removeImage(idx)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <label className="image-upload-btn" htmlFor="images-input">
                    <Upload size={24} />
                    <span>Add Photo</span>
                    <input id="images-input" type="file" accept="image/*" multiple hidden
                      onChange={handleImageChange} />
                  </label>
                )}
              </div>
              <span className="form-hint">JPG, PNG, WEBP · Max 5MB each</span>
            </div>

            <button id="list-item-submit" type="submit" className="btn btn-primary btn-full btn-lg"
              disabled={loading}>
              {loading
                ? <><span className="btn-spinner" /> {uploading ? 'Uploading photos...' : 'Posting item...'}</>
                : <><Package size={18} /> Post Item for Sale</>
              }
            </button>
          </form>

          {/* Tips Sidebar */}
          <div className="list-item-tips">
            <div className="tips-card">
              <h4>📸 Photo Tips</h4>
              <ul>
                <li>Use good lighting (natural light works best)</li>
                <li>Show the item from multiple angles</li>
                <li>Include close-ups of any defects</li>
                <li>Clean the item before photographing</li>
              </ul>
            </div>
            <div className="tips-card">
              <h4>✍️ Description Tips</h4>
              <ul>
                <li>Mention age and purchase date if known</li>
                <li>List any defects or damage honestly</li>
                <li>Describe why you're selling</li>
                <li>Include brand/model number if applicable</li>
              </ul>
            </div>
            <div className="tips-card safety">
              <h4>🔒 Safety Tips</h4>
              <ul>
                <li>Meet buyers in public places</li>
                <li>Don't share bank account details upfront</li>
                <li>Verify payment before handing over item</li>
                <li>Bring a friend when meeting strangers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
