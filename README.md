
Git-jira is a command line tool to act as a bridge between jira and git. It helps provide an easy way to update the
jira tickets corresponding to your code; and creates and manages feature branches based on these tickets.

Sample Workflow
---------------

1. Before starting work on a jira ticket run:

        git-jira --branch MOB-123
    This will create a branch named MOB-123 corresponding to the bug id MOB-123 and update the corresponding ticket to
mark it as "In Progress".
2. Once you are done with the work, run:

        git-jira --dcommit MOB-123
    This will close the reviewboard associated with the last commit, add a comment mentioning details of the last commit
in the ticket MOB-123 and also resolve the issue.

More Examples
-------------

    $ git-jira --branch     // Shows the list of all branches with their corresponding JIRA tickets status
    $ git-jira --status     // Same command.
    $ git-jira --status MOB-123     // Status of a particular bug
    $ git-jira --comment "Test Comment" --id MOB-123    // Adds a comment to the bug MOB-123.
    $ git-jira --comment "Test Comment"    // Adds a comment to the bug referred by the current branch.
    $ git-jira -D -C || close    //This deletes all the branches which their JIRA ticket has been closed already


Misc
----
* For talking with the code-review management tool, we have assumed that there is a command line tool git-review
available. You could modify lib/codeReview.js to suit your needs.
* For authentication with the JIRA system, it stores your username and password encoded in base64 in your project's git
folder. It talks with JIRA through the REST interface exported by JIRA.
