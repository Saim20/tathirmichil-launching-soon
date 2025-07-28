import { Blog } from "@/lib/apis/blogs";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Calendar, Clock, BookOpen } from "lucide-react";
import { bloxat } from "@/components/fonts";
import { processContent, processContentPreview, extractTextContent } from "@/lib/utils/contentProcessor";
import { useEffect, useState } from "react";

export default function BlogCard({ blog }: { blog: Blog }) {
  const [processedTitle, setProcessedTitle] = useState<string>('');
  const [processedPreview, setProcessedPreview] = useState<string>('');

  useEffect(() => {
    const processCardContent = async () => {
      try {
        const htmlTitle = await processContent(blog.title);
        const htmlPreview = await processContentPreview(blog.content, 150);
        
        setProcessedTitle(htmlTitle);
        setProcessedPreview(htmlPreview);
      } catch (error) {
        console.error('Error processing blog card content:', error);
        // Fallback to original content
        setProcessedTitle(blog.title);
        setProcessedPreview(blog.content.substring(0, 150) + '...');
      }
    };

    processCardContent();
  }, [blog.title, blog.content]);

  return (
    <Link href={`/blogs/${blog.id}`} className="block h-full group">
      <div className="h-full bg-tathir-beige rounded-xl p-6 transform group-hover:scale-[1.02] transition-all duration-300 
        [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a,8px_8px_0_#7a4f3a,10px_10px_0_#7a4f3a,12px_12px_1px_rgba(0,0,0,.1)]
        group-hover:[box-shadow:4px_4px_0_#7a4f3a,8px_8px_0_#7a4f3a,12px_12px_0_#7a4f3a,16px_16px_0_#7a4f3a,20px_20px_0_#7a4f3a,24px_24px_1px_rgba(0,0,0,.1)]">
        
        <div className="space-y-6 h-full flex flex-col">

          {/* Blog Title with HTML/Markdown support */}
          <div 
            dangerouslySetInnerHTML={{ __html: processedTitle }}
            className={`text-xl md:text-2xl font-bold text-tathir-maroon leading-tight line-clamp-2 ${bloxat.className} uppercase group-hover:text-tathir-brown transition-colors`}
          />

            {/* Blog Image */}
            <div className="relative aspect-video bg-tathir-cream rounded-xl overflow-hidden group-hover:border-tathir-maroon/40 transition-colors">
            <Image
              src={blog.imageUrl || "/villager.png"}
              alt={extractTextContent(blog.title)}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            </div>

          {/* Blog Preview */}
          <div className="space-y-4 flex-grow">
            <div 
              dangerouslySetInnerHTML={{ __html: processedPreview }}
              className="text-tathir-brown jersey-10-regular text-lg leading-relaxed line-clamp-3 blog-preview"
              style={{
                wordBreak: 'break-word',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
            />
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-tathir-brown/70">
              <div className="flex items-center gap-2 bg-tathir-cream px-3 py-2 rounded-lg">
                <Calendar className="h-4 w-4" />
                <time className="jersey-10-regular text-sm">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </time>
              </div>
              {blog.updatedAt && blog.updatedAt.getTime() !== blog.createdAt.getTime() && (
                <div className="flex items-center gap-2 bg-tathir-cream px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span className="jersey-10-regular text-sm">Updated</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 bg-tathir-maroon/10 text-tathir-maroon rounded-lg font-bold ${bloxat.className} uppercase text-xs
                      border-2 border-tathir-maroon/20 group-hover:bg-tathir-maroon/20 transition-colors`}
                  >
                    {tag}
                  </span>
                ))}
                {blog.tags.length > 3 && (
                  <span className={`px-3 py-1 bg-tathir-brown/10 text-tathir-brown rounded-lg font-bold ${bloxat.className} uppercase text-xs
                    border-2 border-tathir-brown/20`}>
                    +{blog.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Read More Button */}
          <div className="mt-auto pt-4">
            <div className={`w-full px-6 py-4 bg-tathir-maroon text-tathir-beige font-bold rounded-xl 
              group-hover:bg-tathir-brown transition-all duration-300 flex items-center justify-center gap-3 
              ${bloxat.className} uppercase text-lg relative overflow-hidden
              [box-shadow:2px_2px_0_#7a4f3a,4px_4px_0_#7a4f3a,6px_6px_0_#7a4f3a]
              group-hover:[box-shadow:4px_4px_0_#7a4f3a,8px_8px_0_#7a4f3a,12px_12px_0_#7a4f3a]`}>
              <span className="relative z-10">Read Article</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
