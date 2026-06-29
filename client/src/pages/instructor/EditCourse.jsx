import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import courseService from '../../services/courseService';
import toast from '../../utils/toast';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourse(courseId);
      
      if (courseData.instructor?.id !== user?.id) {
        toast.error('You do not have permission to edit this course');
        navigate('/instructor/courses');
        return;
      }
      
      setCourse({
        ...courseData,
        isFree: courseData.isFree || parseFloat(courseData.price || 0) === 0
      });
      setThumbnailPreview(courseData.thumbnailImage);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Course not found');
        navigate('/instructor/courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourse(prev => ({ ...prev, thumbnailFile: file }));
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updateData = {
        title: course.title,
        shortDescription: course.shortDescription,
        fullDescription: course.fullDescription,
        price: course.isFree ? 0 : (parseFloat(course.price) || 0),
        discountPrice: course.discountPrice ? parseFloat(course.discountPrice) : null,
        isFree: course.isFree || false,
      };
      
      if (course.thumbnailFile) {
        await courseService.uploadThumbnail(courseId, course.thumbnailFile);
      }
      
      await courseService.updateCourse(courseId, updateData);
      toast.success('Course updated successfully');
      navigate(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Course</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Course Title
            </label>
            <input
              type="text"
              name="title"
              value={course.title || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
              Course Thumbnail
            </label>
            <div className="relative">
              <img
                src={thumbnailPreview || 'https://via.placeholder.com/800x400'}
                alt="Thumbnail"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <label className="absolute bottom-2 right-2 bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Short Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Short Description
            </label>
            <input
              type="text"
              name="shortDescription"
              value={course.shortDescription || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          {/* Full Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Full Description
            </label>
            <textarea
              name="fullDescription"
              value={course.fullDescription || ''}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
            />
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Pricing</h3>
            
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="isFree"
                checked={course.isFree || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setCourse(prev => ({
                    ...prev,
                    isFree: checked,
                    price: checked ? 0 : (parseFloat(prev.price) || 0)
                  }));
                }}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isFree" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                This course is free
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Price (€)
                </label>
                 <input
                   type="number"
                   name="price"
                   value={course.price || 0}
                   onChange={handleChange}
                   disabled={course.isFree || false}
                   min="0"
                   step="0.01"
                   className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                   Discount Price (€)
                 </label>
                 <input
                   type="number"
                   name="discountPrice"
                   value={course.discountPrice || ''}
                   onChange={handleChange}
                   disabled={course.isFree || false}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/instructor/courses/${courseId}`)}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;