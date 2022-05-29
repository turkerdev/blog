import type { GetServerSideProps, NextPage } from "next";
import {
  CreateInput,
  TCreateInput,
  TCreateOutput,
} from "../lib/validations/post";
import { ZodFormattedError } from "zod";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import axios, { AxiosError } from "axios";
import { ArrowClockwise } from "phosphor-react";
import MarkdownView from "../components/MarkdownView";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

interface Props {
  adminKey: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const adminKey = ctx.req.cookies.admin_key;
  const isValid = adminKey === process.env.ADMIN_KEY;

  if (!adminKey || !isValid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      adminKey,
    },
  };
};

const Create: NextPage<Props> = ({ adminKey }) => {
  const [formbody, setFormBody] = useState<Partial<TCreateInput>>({ adminKey });
  const [formerror, setFormError] = useState<ZodFormattedError<TCreateInput>>();
  const router = useRouter();

  useEffect(() => {
    const res = CreateInput.safeParse(formbody);
    const data = res.success ? undefined : res.error.format();
    setFormError(data);
  }, [formbody]);

  const { isLoading, mutate } = useMutation<
    TCreateOutput,
    AxiosError,
    TCreateInput
  >(async (input) => (await axios.post("/api/post", input)).data, {
    onError: () => {
      toast.error("Something went wrong 😔");
    },
    onSuccess: (data) => {
      toast.success(`Post created successfully 🎉 click to go.`, {
        onClick: () => router.push(`/${data.slug}`),
      });
    },
  });

  function tryMutate() {
    if (isLoading || !formbody || formerror) {
      return;
    }
    mutate(formbody as TCreateInput);
  }

  return (
    <div className="p-5">
      <div className="flex">
        <button
          className={`rounded p-1 px-4 
          ${isLoading && "animate-pulse"}
          ${!formerror && !isLoading && "hover:bg-cyan-600"}
          ${formerror ? "bg-cyan-900" : "bg-cyan-700"}`}
          onClick={() => tryMutate()}
          disabled={isLoading || !!formerror}
        >
          {isLoading ? (
            <>
              <ArrowClockwise className="inline-block animate-spin mr-2" />
              publishing...
            </>
          ) : (
            "publish"
          )}
        </button>
      </div>
      <div className="mt-2 block w-64 mx-auto">
        <input
          className="w-full"
          type="text"
          placeholder="title"
          onChange={(e) =>
            setFormBody((body) => ({ ...body, title: e.target.value }))
          }
        />
        {formerror?.title?._errors.map((err, i) => (
          <p key={i} className="text-red-500">
            • {err}
          </p>
        ))}
        <textarea
          className="w-full mt-2 resize-none"
          placeholder="preview"
          onChange={(e) =>
            setFormBody((body) => ({ ...body, preview: e.target.value }))
          }
        ></textarea>
        {formerror?.preview?._errors.map((err, i) => (
          <p key={i} className="text-red-500">
            • {err}
          </p>
        ))}
      </div>
      <div className="flex mt-5 gap-5 h-[600px]">
        <textarea
          className="w-full resize-none"
          onChange={(e) =>
            setFormBody((body) => ({ ...body, content: e.target.value }))
          }
        ></textarea>
        <MarkdownView
          className="w-full overflow-auto outline-none border border-neutral-700 focus:border-neutral-400 rounded bg-transparent px-1"
          src={formbody.content || ""}
        />
      </div>
    </div>
  );
};

export default Create;
