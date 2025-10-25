export default {
  layout: "post.njk",
  tags: ["post"],
  eleventyComputed: {
    meta: (data) => ({
      title: data.title,
      description: data.description,
      keywords: data.keywords || data.tags,
      image: data.hero?.image,
      type: "article"
    })
  }
};
