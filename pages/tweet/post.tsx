import Button from "@/components/button";
import Layout from "@/components/layout";
import TextArea from "@/components/textarea";
import useMutation from "@/lib/useMutation";
import { Tweet } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UploadTweetForm {
  description: string;
}

interface UploadTweetResult {
  ok: boolean;
  tweet: Tweet;
}

const Upload: NextPage = () => {
  const { register, handleSubmit } = useForm<UploadTweetForm>();

  const router = useRouter();

  const [postTweet, { loading, data }] =
    useMutation<UploadTweetResult>("/api/tweets");

  const onValid = (form: UploadTweetForm) => {
    postTweet(form);
  };

  useEffect(() => {
    if (data?.ok) {
      router.push(`/tweet/${data.tweet.id}`);
    }
  }, [data, router]);

  return (
    <Layout canGoBack seoTitle="Post Tweet">
      <form className="space-y-4 px-4" onSubmit={handleSubmit(onValid)}>
        <TextArea
          register={register("description", {
            required: "Please write the description.",
          })}
          name="description"
          required
          placeholder="What do you have in mind?"
        />

        <Button loading={loading} text="Post Tweet" />
      </form>
    </Layout>
  );
};

export default Upload;
