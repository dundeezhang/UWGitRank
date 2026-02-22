const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export interface GitHubStats {
  stars: number;
  commits: number;
  mergedPRs: number;
}

const query = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      totalCommitContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      nodes {
        stargazerCount
      }
    }
    pullRequests(states: MERGED) {
      totalCount
    }
  }
}
`;

export async function fetchGitHubStats(
  username: string
): Promise<GitHubStats> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN environment variable");
  }

  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { username } }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(
      `GitHub GraphQL error: ${json.errors.map((e: { message: string }) => e.message).join(", ")}`
    );
  }

  const user = json.data.user;
  if (!user) {
    throw new Error(`GitHub user "${username}" not found`);
  }

  const stars = user.repositories.nodes.reduce(
    (sum: number, repo: { stargazerCount: number }) => sum + repo.stargazerCount,
    0
  );

  return {
    stars,
    commits: user.contributionsCollection.totalCommitContributions,
    mergedPRs: user.pullRequests.totalCount,
  };
}
