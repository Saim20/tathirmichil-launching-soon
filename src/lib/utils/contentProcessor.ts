import { remark } from 'remark';
import html from 'remark-html';

// Utility to detect if content is Markdown or HTML
export const isMarkdown = (content: string): boolean => {
  if (!content) return false;
  
  // Simple heuristics to detect Markdown vs HTML
  const markdownPatterns = [
    /^#{1,6}\s+.+$/m,           // Headers (# ## ###)
    /^\*\s+.+$/m,               // Unordered lists
    /^\d+\.\s+.+$/m,            // Ordered lists
    /\*\*[^*\n]+\*\*/,          // Bold **text**
    /\*[^*\n]+\*/,              // Italics *text* (but not unordered lists)
    /`[^`\n]+`/,                // Inline code `code`
    /```[\s\S]*?```/,           // Code blocks
    /^\>\s+.+$/m,               // Blockquotes
    /\[[^\]]+\]\([^)]+\)/,      // Links [text](url)
    /!\[[^\]]*\]\([^)]+\)/,     // Images ![alt](url)
    /^\-\s+.+$/m,               // Unordered lists with -
    /^\+\s+.+$/m,               // Unordered lists with +
    /^[\s]*[\-\*\_]{3,}[\s]*$/m // Horizontal rules
  ];

  const htmlPatterns = [
    /<[a-zA-Z][^>]*>/,          // HTML tags
    /&[a-zA-Z0-9]+;/            // HTML entities
  ];

  // Strong indicators of HTML - if found, treat as HTML
  const strongHtmlPatterns = [
    /<\/[a-zA-Z]+>/,            // Closing HTML tags
    /<[a-zA-Z]+[^>]*\/>/,       // Self-closing tags
    /<(div|span|p|h[1-6]|ul|ol|li|blockquote|pre|code|table|tr|td|th|img|a)\b/i
  ];

  // If it has strong HTML indicators, definitely HTML
  if (strongHtmlPatterns.some(pattern => pattern.test(content))) {
    console.log('Detected as HTML (strong indicators)');
    return false;
  }

  // Count Markdown vs HTML patterns
  const markdownScore = markdownPatterns.reduce((score, pattern) => {
    return score + (pattern.test(content) ? 1 : 0);
  }, 0);

  const htmlScore = htmlPatterns.reduce((score, pattern) => {
    return score + (pattern.test(content) ? 1 : 0);
  }, 0);


  // If more Markdown patterns than HTML patterns, treat as Markdown
  // Or if there are Markdown patterns and no HTML patterns
  const isMarkdownContent = markdownScore > htmlScore || (markdownScore > 0 && htmlScore === 0);
  
  return isMarkdownContent;
};

// Convert Markdown to HTML
export const markdownToHtml = async (markdown: string): Promise<string> => {
  try {
    const result = await remark()
      .use(html, { sanitize: false }) // Allow HTML in Markdown
      .process(markdown);
    const htmlResult = result.toString();
    return htmlResult;
  } catch (error) {
    console.error('Error processing Markdown:', error);
    return `<p>${markdown}</p>`; // Fallback to wrapped plain text
  }
};

// Process content (Markdown or HTML) to HTML
export const processContent = async (content: string): Promise<string> => {
  if (!content) return '';
  
  // First, try to extract Markdown from HTML if it's wrapped
  const extractedMarkdown = extractMarkdownFromHtml(content);
  
  if (extractedMarkdown !== content) {
    // Process the extracted Markdown
    try {
      const result = await markdownToHtml(extractedMarkdown);
      return result;
    } catch (error) {
      console.error('Error processing extracted Markdown:', error);
    }
  }
  
  // Check if it's Markdown content
  if (isMarkdown(content)) {
    return await markdownToHtml(content);
  }
  
  return content; // Already HTML
};

// Extract Markdown content from HTML wrappers
export const extractMarkdownFromHtml = (content: string): string => {
  // Common patterns where Markdown might be wrapped in HTML
  const patterns = [
    // Content inside paragraph tags
    /<p[^>]*>([\s\S]*?)<\/p>/gi,
    // Content inside div tags
    /<div[^>]*>([\s\S]*?)<\/div>/gi,
    // Content inside span tags  
    /<span[^>]*>([\s\S]*?)<\/span>/gi,
    // Content inside any block element
    /<(article|section|main)[^>]*>([\s\S]*?)<\/\1>/gi
  ];
  
  let extractedContent = content;
  let foundMarkdown = false;
  
  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const innerContent = match[1] || match[2] || '';
      
      // Check if the inner content has Markdown patterns
      if (hasMarkdownPatterns(innerContent)) {
        extractedContent = innerContent;
        foundMarkdown = true;
        break;
      }
    }
    if (foundMarkdown) break;
  }
  
  // If no Markdown found in HTML wrappers, try simple HTML tag removal
  if (!foundMarkdown && /<[^>]+>/.test(content)) {
    const withoutTags = content.replace(/<[^>]*>/g, '');
    if (hasMarkdownPatterns(withoutTags)) {
      extractedContent = withoutTags;
    }
  }
  
  return extractedContent;
};

// Check if content has Markdown patterns
export const hasMarkdownPatterns = (content: string): boolean => {
  const markdownPatterns = [
    /^#{1,6}\s+.+$/m,           // Headers (# ## ###)
    /^\*\s+.+$/m,               // Unordered lists
    /^\-\s+.+$/m,               // Unordered lists with -
    /^\d+\.\s+.+$/m,            // Ordered lists
    /\*\*[^*\n]+\*\*/,          // Bold **text**
    /\*[^*\n]+\*/,              // Italics *text*
    /`[^`\n]+`/,                // Inline code `code`
    /```[\s\S]*?```/,           // Code blocks
    /^\>\s+.+$/m,               // Blockquotes
    /\[[^\]]+\]\([^)]+\)/,      // Links [text](url)
    /!\[[^\]]*\]\([^)]+\)/,     // Images ![alt](url)
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
};

// Helper function to force Markdown processing (for testing)
export const processMarkdown = async (content: string): Promise<string> => {
  return await markdownToHtml(content);
};

// Extract plain text from content (Markdown or HTML)
export const extractTextContent = (content: string): string => {
  if (!content) return '';
  
  if (isMarkdown(content)) {
    // For Markdown, remove Markdown syntax
    return content
      .replace(/^#{1,6}\s+/gm, '')           // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1')     // Remove bold
      .replace(/\*([^*]+)\*/g, '$1')         // Remove italics
      .replace(/`([^`]+)`/g, '$1')           // Remove inline code
      .replace(/```[\s\S]*?```/g, '')        // Remove code blocks
      .replace(/^\>\s+/gm, '')               // Remove blockquotes
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Extract image alt text
      .replace(/^\*\s+/gm, '')               // Remove list markers
      .replace(/^\d+\.\s+/gm, '')            // Remove numbered list markers
      .replace(/^\-\s+/gm, '')               // Remove dash list markers
      .replace(/^\+\s+/gm, '')               // Remove plus list markers
      .replace(/\n+/g, ' ')                  // Replace newlines with spaces
      .trim();
  } else {
    // For HTML, use DOM parsing
    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = content;
      return div.textContent || div.innerText || '';
    } else {
      // Server-side fallback - simple HTML tag removal
      return content.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z0-9]+;/g, ' ').trim();
    }
  }
};

// Process content for preview (truncated)
export const processContentPreview = async (content: string, maxLength: number = 150): Promise<string> => {
  const textContent = extractTextContent(content);
  const truncated = textContent.length > maxLength 
    ? textContent.substring(0, maxLength) + '...' 
    : textContent;
  
  if (isMarkdown(content)) {
    // For Markdown preview, convert truncated text back to simple HTML
    return `<p>${truncated}</p>`;
  } else {
    // For HTML, truncate the HTML content
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  }
};
