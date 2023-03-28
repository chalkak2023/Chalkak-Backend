import { User } from "src/auth/entities/user.entity";
import { Photospot } from "src/photospot/entities/photospot.entity";
import { CollectionKeyword } from "src/collections/entities/collection.keyword.entity";
import { CollectionLike } from "src/collections/entities/collection.like.entity";

type CollectionList = {
  isCollectionLiked: boolean;
  likes: number;
  id: number;
  userId: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: User;
  photospots: Photospot[];
  collectionLikes: CollectionLike[];
  collectionKeywords: CollectionKeyword[];
}

export type {
  CollectionList,
};