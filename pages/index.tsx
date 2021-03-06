import type { GetStaticProps, NextPage } from "next";
import { prisma } from "../lib/db";
import Head from "next/head";
import PostCard from "../components/PostCard";

interface Props {
  blogs: {
    slug: string;
    title: string;
    preview: string;
    createdAt: string;
  }[];
}

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const rawBlogs = await prisma.blog.findMany({
    select: {
      slug: true,
      title: true,
      preview: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const blogs: Props["blogs"] = rawBlogs.map((blog) => ({
    slug: blog.slug,
    preview: blog.preview,
    title: blog.title,
    createdAt: blog.createdAt.toUTCString(),
  }));

  return {
    props: { blogs },
  };
};

const Home: NextPage<Props> = ({ blogs }) => {
  return (
    <>
      <Head>
        <title>Blog | turker.dev</title>
      </Head>
      <div className="divide-y divide-solid divide-neutral-700 my-10">
        {blogs.map((blog) => (
          <PostCard
            key={blog.slug}
            slug={blog.slug}
            title={blog.title}
            preview={blog.preview}
            createdAt={blog.createdAt}
          />
        ))}
      </div>
    </>
  );
};

export default Home;
