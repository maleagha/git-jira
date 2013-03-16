Git-jira is a command line tool to act as a bridge between jira and git. It helps provide an easy way to update the
jira tickets corresponding to your code; and creates and manages feature branches based on these tickets. Here is the
sample usage:

1. Before starting work on a jira ticket run:
  git-jira --branch MOB-123
This will create a branch named MOB-123 corresponding to the bug id MOB-123 and update the corresponding ticket to
mark it as "In Progress".
2. Once you are done with the work, run:
  git-jira --dcommit MOB-123
This will close the reviewboard associated with the last commit, add a comment mentioning details of the last commit
in the ticket MOB-123 and also resolve the issue.
3. You can check the status of an issue by saying:
  git-jira --status MOB-123
  or check status of all branches by saying:
  git-jira --branch status
For talking with the code-review management tool, we have assumed that there is a command line tool git-review
available. You could modify lib/codeReview.js to suit your needs.

For authentication with the JIRA system, it stores your username and password encoded in base64 in your project's git
folder. It talks with JIRA through the REST interface exported by JIRA.
