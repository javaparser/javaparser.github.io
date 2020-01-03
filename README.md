# About

This is the source for the JavaParser.org website.

It uses a combination of static HTML pages and the Jekyll publishing engine.

The original website template is available on the TEMPLATE branch

# Setup 

If you wish to edit the static html pages you can clone the repository edit and push the changes as usual. 

In order to publish blog posts you will need to setup Jekyll with Bundler, using [this](https://jekyllrb.com/tutorials/using-jekyll-with-bundler/) guide. The current site has been built with Bundler v2.0.2.

From the root of the repository you should be able to run:

```
bundle exec jekyll server
```

The site should be served on `localhost:4000`

# Publishing Blog Posts

1) Create a new markdown file in the `_post` directory using the established naming convention.

2) Providing you are running `bundle exec jekyll server` the markdown file should be generated as html in the `_site` directory.

3) After you have create a post, edit the cards in the blog grid in the `blog.html` page so it is accessible from the blog index.

4) Commit and push the markdown, edits to blog.html and generated html file.

