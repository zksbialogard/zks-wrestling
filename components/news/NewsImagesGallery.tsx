import Image from "next/image";

import type { NewsImage } from "@/lib/news-images";

type Props = {
  images: NewsImage[];
  title: string;
};

export default function NewsImagesGallery({ images, title }: Props) {
  if (!images.length) {
    return null;
  }

  if (images.length === 1) {
    const image = images[0];

    return (
      <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-xl border border-zks-gold-mid/15">
        <Image
          src={image.url}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {images.map((image, index) => (
        <li
          key={`${image.storagePath || image.url}-${index}`}
          className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zks-gold-mid/15"
        >
          <Image
            src={image.url}
            alt={`${title} — zdjęcie ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
            unoptimized
          />
        </li>
      ))}
    </ul>
  );
}
