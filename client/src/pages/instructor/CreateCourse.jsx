// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import courseService from '../../services/courseService';
// import categoryService from '../../services/categoryService';

// const CreateCourse = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [formData, setFormData] = useState({
//     categoryId: '',
//     title: '',
//     slug: '',
//     shortDescription: '',
//     fullDescription: '',
//     price: '',
//     discountPrice: '',
//     level: 'BEGINNER',
//     language: 'en',
//     estimatedDuration: ''
//   });
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const data = await categoryService.getAllCategories();
//       setCategories(data);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Auto-generate slug from title
//     if (name === 'title') {
//       const slug = value
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/(^-|-$)/g, '');
//       setFormData(prev => ({ ...prev, slug }));
//     }

//     // Clear error when user types
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validate = () => {
//     const newErrors = {};

//     if (!formData.categoryId) newErrors.categoryId = 'Category is required';
//     if (!formData.title.trim()) newErrors.title = 'Title is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
//     if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
//     if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validate()) return;

//     try {
//       setLoading(true);
//       const course = await courseService.createCourse(formData);
      
//       // Navigate to course builder to add sections/lessons
//       navigate(`/instructor/courses/${course.id}/builder`);
//     } catch (error) {
//       console.error('Error creating course:', error);
//       alert(error.response?.data?.message || 'Failed to create course');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-4xl">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Course</h1>
//           <p className="text-gray-600">Fill in the basic information about your course</p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
//           {/* Category */}
//           <div className="mb-6">
//             <label className="block text-gray-700 font-medium mb-2">
//               Category <span className="text-red-500">*</span>
//             </label>
//             <select
//               name="categoryId"
//               value={formData.categoryId}
//               onChange={handleChange}
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.categoryId ? 'border-red-500' : 'border-gray-300'
//               }`}
//             >
//               <option value="">Select a category</option>
//               {categories.map((category) => (
//                 <option key={category.id} value={category.id}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//             {errors.categoryId && (
//               <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
//             )}
//           </div>

//           {/* Title */}
//           <div className="mb-6">
//             <label className="block text-gray-700 font-medium mb-2">
//               Course Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               placeholder="e.g., Complete Web Development Bootcamp"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.title ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.title && (
//               <p className="text-red-500 text-sm mt-1">{errors.title}</p>
//             )}
//           </div>

//           {/* Slug */}
//           <div className="mb-6">
//             <label className="block text-gray-700 font-medium mb-2">
//               URL Slug <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               name="slug"
//               value={formData.slug}
//               onChange={handleChange}
//               placeholder="complete-web-development-bootcamp"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.slug ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.slug && (
//               <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
//             )}
//             <p className="text-gray-500 text-sm mt-1">Auto-generated from title</p>
//           </div>

//           {/* Short Description */}
//           <div className="mb-6">
//             <label className="block text-gray-700 font-medium mb-2">
//               Short Description <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               name="shortDescription"
//               value={formData.shortDescription}
//               onChange={handleChange}
//               rows="3"
//               placeholder="A brief description that appears in course listings"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.shortDescription ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.shortDescription && (
//               <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>
//             )}
//           </div>

//           {/* Full Description */}
//           <div className="mb-6">
//             <label className="block text-gray-700 font-medium mb-2">
//               Full Description
//             </label>
//             <textarea
//               name="fullDescription"
//               value={formData.fullDescription}
//               onChange={handleChange}
//               rows="6"
//               placeholder="Detailed course description, what students will learn, etc."
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Price & Discount Price */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">
//                 Price (USD) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 name="price"
//                 value={formData.price}
//                 onChange={handleChange}
//                 min="0"
//                 step="0.01"
//                 placeholder="99.99"
//                 className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   errors.price ? 'border-red-500' : 'border-gray-300'
//                 }`}
//               />
//               {errors.price && (
//                 <p className="text-red-500 text-sm mt-1">{errors.price}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-gray-700 font-medium mb-2">
//                 Discount Price (USD)
//               </label>
//               <input
//                 type="number"
//                 name="discountPrice"
//                 value={formData.discountPrice}
//                 onChange={handleChange}
//                 min="0"
//                 step="0.01"
//                 placeholder="79.99"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           {/* Level & Language */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">Level</label>
//               <select
//                 name="level"
//                 value={formData.level}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="BEGINNER">Beginner</option>
//                 <option value="INTERMEDIATE">Intermediate</option>
//                 <option value="ADVANCED">Advanced</option>
//                 <option value="ALL_LEVELS">All Levels</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-gray-700 font-medium mb-2">Language</label>
//               <select
//                 name="language"
//                 value={formData.language}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="en">English</option>
//                 <option value="fr">French</option>
//                 <option value="ar">Arabic</option>
//                 <option value="es">Spanish</option>
//               </select>
//             </div>
//           </div>

//           {/* Estimated Duration */}
//           <div className="mb-8">
//             <label className="block text-gray-700 font-medium mb-2">
//               Estimated Duration (hours)
//             </label>
//             <input
//               type="number"
//               name="estimatedDuration"
//               value={formData.estimatedDuration}
//               onChange={handleChange}
//               min="0"
//               placeholder="10"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Submit Buttons */}
//           <div className="flex gap-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Creating...' : 'Create Course & Continue'}
//             </button>
//             <button
//               type="button"
//               onClick={() => navigate('/instructor/dashboard')}
//               className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateCourse;

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
    isFree: false,  // 🆕 NEW FIELD
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

    // 🆕 If toggling to free, set price to 0
    if (name === 'isFree' && checked) {
      setFormData(prev => ({
        ...prev,
        price: '0',
        discountPrice: ''
      }));
    }

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }

    // Clear error when user types
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
    
    // 🆕 Only validate price if course is not free
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
      
      // 🆕 Prepare data with proper types
      const submitData = {
        ...formData,
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null,
        isFree: formData.isFree
      };
      
      const course = await courseService.createCourse(submitData);
      
      // Navigate to course builder to add sections/lessons
      navigate(`/instructor/courses/${course.id}/builder`);
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Course</h1>
          <p className="text-gray-600">Fill in the basic information about your course</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Category */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Complete Web Development Bootcamp"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="complete-web-development-bootcamp"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">Auto-generated from title</p>
          </div>

          {/* Short Description */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows="3"
              placeholder="A brief description that appears in course listings"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.shortDescription ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.shortDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>
            )}
          </div>

          {/* Full Description */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Full Description
            </label>
            <textarea
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleChange}
              rows="6"
              placeholder="Detailed course description, what students will learn, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 🆕 PRICING SECTION */}
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h3>
            
            {/* Free Course Toggle */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition">
                      Make this course completely FREE
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Perfect for building your audience, creating a portfolio, or giving back to the community. 
                    All lessons will be accessible to everyone without payment.
                  </p>
                </div>
              </label>
            </div>

            {/* Paid Course Pricing - Only show if not free */}
            {!formData.isFree ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2 text-gray-500 text-lg">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="99.99"
                        className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Discount Price (USD)
                      <span className="text-gray-500 text-xs ml-2">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2 text-gray-500 text-lg">$</span>
                      <input
                        type="number"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="79.99"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">💡</span>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Pro Tip: Freemium Strategy</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Even for paid courses, you can mark individual lessons as "free" or "preview" 
                        in the course builder. This lets students sample your content before buying!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✓</span>
                  <div>
                    <p className="text-sm font-medium text-green-800">Free Course Selected</p>
                    <p className="text-sm text-green-700 mt-1">
                      This course will be completely free for all students. All lessons will be accessible 
                      without enrollment. You can still use "preview" markers to highlight key lessons!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Level & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ALL_LEVELS">All Levels</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>

          {/* Estimated Duration */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">
              Estimated Duration (hours)
            </label>
            <input
              type="number"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              min="0"
              placeholder="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Creating...' : 'Create Course & Continue →'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/instructor/dashboard')}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          </div>

          {/* Course Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>📋</span>
              Course Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>{' '}
                <span className="font-medium">
                  {formData.isFree ? '🎁 Free Course' : '💰 Paid Course'}
                </span>
              </div>
              {!formData.isFree && formData.price && (
                <div>
                  <span className="text-gray-600">Price:</span>{' '}
                  <span className="font-medium">${formData.price}</span>
                  {formData.discountPrice && (
                    <span className="text-green-600 ml-2 text-xs">
                      (${formData.discountPrice} after discount)
                    </span>
                  )}
                </div>
              )}
              <div>
                <span className="text-gray-600">Level:</span>{' '}
                <span className="font-medium">{formData.level}</span>
              </div>
              <div>
                <span className="text-gray-600">Language:</span>{' '}
                <span className="font-medium">{formData.language === 'en' ? 'English' : formData.language}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;