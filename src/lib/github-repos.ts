import { unstable_cache } from "next/cache";
import { graphql } from "./github";

export interface TopRepo {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  primaryLanguage: { name: string; color: string } | null;
}

type TopReposQueryData = {
  user: {
    repositories: {
      nodes: Array<{
        name: string;
        description: string | null;
        url: string;
        stargazerCount: number;
        primaryLanguage: { name: string; color: string } | null;
      }>;
    };
  } | null;
};

const topReposQuery = `
query($username: String!) {
  user(login: $username) {
    repositories(first: 3, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
      nodes {
        name
        description
        url
        stargazerCount
        primaryLanguage { name color }
      }
    }
  }
}
`;

async function fetchTopReposUncached(username: string): Promise<TopRepo[]> {
  const data = await graphql<TopReposQueryData>(topReposQuery, { username });
  return data.user?.repositories.nodes ?? [];
}

export async function fetchTopRepos(username: string): Promise<TopRepo[]> {
  const getCached = unstable_cache(
    () => fetchTopReposUncached(username),
    [`top-repos-${username}`],
    { revalidate: 3600, tags: [`top-repos-${username}`] },
  );
  return getCached();
}
