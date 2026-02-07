import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import categoryService from '../../services/categoryService';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    isFree: false,
    price: '',
    discountPrice: '',
    level: 'BEGINNER',
    language: 'en',
    estimatedDuration: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'isFree' && checked) {
      setFormData(prev => ({
        ...prev,
        price: '0',
        discountPrice: ''
      }));
    }

    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';

    if (!formData.isFree && (!formData.price || parseFloat(formData.price) <= 0)) {
      newErrors.price = 'Valid price is required for paid courses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null,
        isFree: formData.isFree
      };

      const course = await courseService.createCourse(submitData);
      navigate(`/instructor/courses/${course.id}/builder`);
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Create New Course</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Fill in the basic information about your course</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-800 p-10 transition-all duration-300">
          {/* Category */}
          <div className="mb-8">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              Course Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all shadow-inner appearance-none cursor-pointer ${errors.categoryId ? 'ring-2 ring-rose-500' : ''
                }`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="dark:bg-slate-800">
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{errors.categoryId}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-8">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              Course Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Complete Web Development Bootcamp"
              className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner ${errors.title ? 'ring-2 ring-rose-500' : ''
                }`}
            />
            {errors.title && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div className="mb-8">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="complete-web-development-bootcamp"
              className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner ${errors.slug ? 'ring-2 ring-rose-500' : ''
                }`}
            />
            {errors.slug && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{errors.slug}</p>
            )}
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">Auto-generated from title</p>
          </div>

          {/* Short Description */}
          <div className="mb-8">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              Short Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows="3"
              placeholder="A brief description that appears in course listings"
              className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner ${errors.shortDescription ? 'ring-2 ring-rose-500' : ''
                }`}
            />
            {errors.shortDescription && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{errors.shortDescription}</p>
            )}
          </div>

          {/* Full Description */}
          <div className="mb-10">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              Full Description
            </label>
            <textarea
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleChange}
              rows="6"
              placeholder="Detailed course description, what students will learn, etc."
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner"
            />
          </div>

          {/* Pricing Section */}
          <div className="mb-10 border-t border-slate-100 dark:border-slate-800 pt-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-center">Pricing Strategy</h3>

            {/* Free Course Toggle */}
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/20">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleChange}
                  className="w-6 h-6 text-indigo-600 dark:text-indigo-500 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-indigo-500 dark:bg-slate-800 mt-1 cursor-pointer"
                />
                <div className="ml-5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎁</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      Make this course completely FREE
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium leading-relaxed">
                    Perfect for building your audience, creating a portfolio, or giving back to the community.
                    All content will be accessible to everyone without payment.
                  </p>
                </div>
              </label>
            </div>

            {/* Paid Course Pricing */}
            {!formData.isFree ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
                      Regular Price (USD) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg font-black transition-colors group-focus-within:text-indigo-500">€</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="99.99"
                        className={`w-full pl-10 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner font-black ${errors.price ? 'ring-2 ring-rose-500' : ''
                          }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
                      Discount Price (USD)
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] ml-2 uppercase tracking-widest">(optional)</span>
                    </label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg font-black transition-colors group-focus-within:text-emerald-500">€</span>
                      <input
                        type="number"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="79.99"
                        className="w-full pl-10 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner font-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 p-5 rounded-2xl">
                  <div className="flex items-start">
                    <span className="text-2xl mr-4">💡</span>
                    <div>
                      <p className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">Pro Tip: Freemium Strategy</p>
                      <p className="text-sm text-amber-700 dark:text-amber-500 mt-2 font-medium leading-relaxed">
                        Even for paid courses, you can mark individual lessons as "free" or "preview"
                        later in the course builder. This lets students sample your content before buying!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-400 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start">
                  <span className="text-2xl mr-4">✨</span>
                  <div>
                    <p className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Free Course Selected</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-2 font-medium leading-relaxed">
                      This course will be completely free for all students. Increase your reach and showcase your
                      expertise to the widest possible audience!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Level & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all shadow-inner appearance-none cursor-pointer"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ALL_LEVELS">All Levels</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all shadow-inner appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>

          {/* Estimated Duration */}
          <div className="mb-10">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              Estimated Duration (hours)
            </label>
            <input
              type="number"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              min="0"
              placeholder="10"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner font-bold"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all font-black shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Creating...' : 'Create Course & Continue →'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/instructor/courses')}
              className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-black active:scale-95"
            >
              Cancel
            </button>
          </div>

          {/* Course Summary */}
          <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-3 uppercase tracking-[0.2em]">
              <span className="w-8 h-px bg-slate-200 dark:bg-slate-700"></span>
              Configuration Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px] font-black uppercase tracking-widest">
              <div>
                <span className="text-slate-400 dark:text-slate-600 block mb-1">Type</span>
                <span className="text-slate-900 dark:text-white">
                  {formData.isFree ? '🎁 Free' : '💰 Paid'}
                </span>
              </div>
              {!formData.isFree && formData.price && (
                <div>
                  <span className="text-slate-400 dark:text-slate-600 block mb-1">Price</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formData.price}€</span>
                  {formData.discountPrice && (
                    <span className="text-emerald-500 dark:text-emerald-400 ml-2">({formData.discountPrice}€)</span>
                  )}
                </div>
              )}
              <div>
                <span className="text-slate-400 dark:text-slate-600 block mb-1">Level</span>
                <span className="text-slate-900 dark:text-white">{formData.level}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-600 block mb-1">Language</span>
                <span className="text-slate-900 dark:text-white">{formData.language === 'en' ? 'English' : formData.language}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;