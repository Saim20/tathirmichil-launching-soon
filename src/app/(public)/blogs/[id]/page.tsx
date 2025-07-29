"use client";

import { Blog, getBlogById } from "@/lib/apis/blogs";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, ChevronLeft, BookOpen } from 'lucide-react';
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { bloxat } from "@/components/fonts";
import { processContent, extractTextContent } from "@/lib/utils/contentProcessor";
import useInView from "../../../../lib/utils";

const BlogDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [processedTitle, setProcessedTitle] = useState<string>('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await getBlogById(id);
        if (!response.success || !response.data) {
          notFound();
        }
        setBlog(response.data);
        
        // Process content and title (Markdown to HTML if needed)
        const htmlContent = await processContent(response.data.content);
        const htmlTitle = await processContent(response.data.title);
        
        setProcessedContent(htmlContent);
        setProcessedTitle(htmlTitle);
        
        // Log for debugging
        console.log('Original content preview:', response.data.content.substring(0, 200));
        console.log('Processed content preview:', htmlContent.substring(0, 200));
        
        // Test Markdown processing (uncomment to test)
        // import { testMarkdownProcessing } from "@/lib/utils/contentProcessor";
        // testMarkdownProcessing().then(result => console.log('Test result:', result));
      } catch (error) {
        console.error("Error fetching blog:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tathir-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-tathir-maroon mx-auto mb-4"></div>
          <p className={`text-tathir-brown font-bold text-xl ${bloxat.className} uppercase`}>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-tathir-cream p-4 md:p-6 pb-16">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Back Button */}
        <AnimatedSection>
          <Link 
            href="/blogs" 
            className={`inline-flex items-center gap-2 text-tathir-maroon hover:text-tathir-brown transition-colors font-bold text-base md:text-lg ${bloxat.className} uppercase
              px-4 md:px-6 py-2 md:py-3 bg-tathir-beige rounded-xl
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a]
              transform hover:scale-[1.02] transition-all duration-300`}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            Back to Blogs
          </Link>
        </AnimatedSection>

        {/* Blog Header */}
          <div className="bg-tathir-beige rounded-xl p-4 md:p-8 
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]">
            <div className="space-y-4 md:space-y-6">
              {/* Blog Title with HTML/Markdown support */}
              <div 
                dangerouslySetInnerHTML={{ __html: processedTitle }}
                className={`text-2xl md:text-3xl lg:text-4xl font-bold text-tathir-maroon leading-tight ${bloxat.className} uppercase break-words`}
              />

              {/* Blog Image */}
              <div className="relative aspect-video h-48 md:h-64 lg:h-80 bg-tathir-cream rounded-xl overflow-hidden border-4 border-tathir-maroon/20">
                <Image
                  src={blog.imageUrl || "/villager.png"}
                  alt={extractTextContent(blog.title)}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Blog Metadata */}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 md:gap-6 text-tathir-brown/70">
                <div className="flex items-center gap-2 bg-tathir-cream px-3 md:px-4 py-2 rounded-lg">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <time className="jersey-10-regular text-base md:text-lg">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                {blog.updatedAt && blog.updatedAt.getTime() !== blog.createdAt.getTime() && (
                  <div className="flex items-center gap-2 bg-tathir-cream px-3 md:px-4 py-2 rounded-lg">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <time className="jersey-10-regular text-base md:text-lg">
                      Updated: {new Date(blog.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                )}
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 md:px-4 py-1 md:py-2 bg-tathir-maroon/10 text-tathir-maroon rounded-xl font-bold ${bloxat.className} uppercase text-xs md:text-sm
                        border-2 border-tathir-maroon/20 break-words`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

        {/* Blog Content */}
          <div className="bg-tathir-beige rounded-xl p-4 md:p-8 
            [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]">
            
            <div 
              dangerouslySetInnerHTML={{ __html: processedContent }}
              className="prose prose-sm md:prose-lg max-w-none text-tathir-brown leading-relaxed blog-content jersey-10-regular
                overflow-hidden break-words
                [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:md:pl-6 [&_ol]:my-3 [&_ol]:md:my-4
                [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:md:pl-6 [&_ul]:my-3 [&_ul]:md:my-4
                [&_li]:my-1 [&_li]:md:my-2 [&_li]:text-tathir-brown [&_li]:break-words
                [&_li_p]:m-0 [&_li_p]:p-0 [&_li_p]:inline
                [&_h1]:text-tathir-maroon [&_h1]:font-bold [&_h1]:text-xl [&_h1]:md:text-2xl [&_h1]:mt-4 [&_h1]:md:mt-6 [&_h1]:mb-3 [&_h1]:md:mb-4 [&_h1]:break-words
                [&_h2]:text-tathir-maroon [&_h2]:font-bold [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:mt-3 [&_h2]:md:mt-5 [&_h2]:mb-2 [&_h2]:md:mb-3 [&_h2]:break-words
                [&_h3]:text-tathir-maroon [&_h3]:font-bold [&_h3]:text-base [&_h3]:md:text-lg [&_h3]:mt-3 [&_h3]:md:mt-4 [&_h3]:mb-2 [&_h3]:break-words
                [&_p]:mb-3 [&_p]:md:mb-4 [&_p]:leading-relaxed [&_p]:break-words [&_p]:overflow-wrap-anywhere
                [&_strong]:text-tathir-maroon [&_strong]:font-bold [&_strong]:break-words
                [&_em]:italic [&_em]:text-tathir-brown [&_em]:break-words
                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
                [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:whitespace-nowrap [&_table]:md:whitespace-normal [&_table]:md:table
                [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:bg-tathir-cream [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-4
                [&_code]:text-sm [&_code]:bg-tathir-cream [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:break-all"
              style={{
                fontSize: '16px',
                lineHeight: '1.7'
              }}
            />
          </div>
      </div>
    </div>
  );
};

// AnimatedSection wrapper with enhanced scroll animation
const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 rotate-0 scale-100"
          : "opacity-0 translate-y-12 -rotate-2 scale-95"
      }`}
    >
      {children}
    </div>
  );
};

export default BlogDetailsPage;
