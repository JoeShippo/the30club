import { Achievement } from '@30plants/core';
import { X, Share2, Copy } from 'lucide-react';
import { generateShareCard } from '@/utils/shareCardNew';
import { useState } from 'react';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    if (!achievement) return '';
    return `🎉 Achievement Unlocked: ${achievement.name}!\n\n${achievement.description}\n\nJoin me on The 30 Club: https://app.the30club.com`;
  };

  const handleShare = async () => {
    if (!achievement) return;

    setIsSharing(true);

    try {
      const imageBlob = await generateShareCard(achievement);
      const file = new File([imageBlob], 'achievement.png', { 
        type: 'image/png',
        lastModified: Date.now(),
      });

      const text = getShareText();

      // Try native share with file
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Achievement Unlocked!',
            text,
            files: [file],
          });
          setIsSharing(false);
          return;
        } catch (error: any) {
          if (error.name === 'AbortError') {
            setIsSharing(false);
            return;
          }
          console.log('Share with file failed:', error);
        }
      }

      // Fallback: Copy image to clipboard + show text
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': imageBlob,
            }),
          ]);
          
          // Also copy text to clipboard in a second step
          setTimeout(async () => {
            try {
              await navigator.clipboard.writeText(text);
              alert('✅ Image copied!\n\nText has been copied too. Paste both into your message:\n1. Long press → Paste (for image)\n2. Type and paste again (for text)');
            } catch {
              alert(`✅ Image copied to clipboard!\n\nHere's the text to copy:\n\n${text}`);
            }
          }, 100);
          
          setIsSharing(false);
          return;
        } catch (error) {
          console.log('Clipboard failed:', error);
        }
      }

      // Last resort: Download image
      const downloadUrl = URL.createObjectURL(imageBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${achievement.id}-achievement.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      alert(`Image downloaded!\n\nShare this text too:\n\n${text}`);
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Failed to copy text');
    }
  };

  if (!achievement) return null;

  return (
    <div className="toast toast-bottom toast-end z-50 mb-20 lg:mb-4 mr-4">
      <div className="card bg-white border-2 border-success shadow-xl w-96 max-w-[calc(100vw-2rem)]">
        <div className="card-body p-4 gap-4">
          
          {/* Header: Title + Close */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-success">Achievement Unlocked!</h3>
            <button 
              onClick={onClose} 
              className="btn btn-sm btn-circle btn-ghost"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Icon + Content */}
          <div className="flex items-center gap-4">
            <div className="text-6xl shrink-0">{achievement.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold mb-1">{achievement.name}</div>
              <div className="text-sm opacity-70">{achievement.description}</div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="btn btn-success flex-1 gap-2"
            >
              {isSharing ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </button>

            <button
              onClick={handleCopyText}
              className="btn btn-outline btn-success gap-2"
            >
              {copied ? (
                <>✓ Copied</>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}