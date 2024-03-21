import * as React from "react";

import { Button } from "./button";

export const Review = () => {
  const reviewPageUrl = "https://wordpress.org/support/plugin/woocommerce-pos/reviews/#new-post";

  return (
    <div className="wcpos-bg-gray-50 wcpos-p-6 wcpos-rounded-lg wcpos-space-y-4">
      <h2 className="wcpos-text-2xl wcpos-font-semibold wcpos-m-0">Leave a review</h2>
      <p>We hope you're finding our plugin helpful. If you have a moment, please leave us a review on WordPress.org. It really helps us to keep improving and offering the best service possible!</p>

      <Button href={reviewPageUrl} target="_blank">
        Leave a Review
      </Button>
    </div>
  );
};
