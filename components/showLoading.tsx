import { Loader } from "@/components/ui/loader";

export const ShowLoading = ({
  text,
  loadingSize,
}: {
  text: string;
  loadingSize?:
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "small"
  | "micro"
  | "tiny"
  | "extra-small"
  | "medium"
  | "large"
  | "extra-large";
}) => {
  return (
    <div className="flex items-center gap-2">
      <Loader
        className="text-muted-foreground"
        size={loadingSize ? loadingSize : "small"}
        variant="ring"
      />
      <p className="">{text}</p>
    </div>
  );
};
