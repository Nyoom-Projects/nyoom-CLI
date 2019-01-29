# Nyoom-CLI
This repo stores the CLI (Command Line Interface) that interacts with nyoom-local-server to manage projects, and schedule tasks, and view task statuses.
This server sends commands (via a REST API) to nyoom-local-server.


## How tasks work:
1. A task is a collection of 'commands', which are logically grouped together at the user's discretion.
2. When a task is marked to be executed, each command for that task is scheduled to run sequentially, and the next command will only be executed if the previous command completed successfully.
3. Tasks are specified in the `tasks` section of a Project's nyoom.yml configuration file - see `nyoom.yml` in this repository for an example.


## Executing tasks locally:
1. Using the Nyoom-CLI; a user will execute `nyoom local exec <project-name> :<task...>`, which will execute the specified task(s) on the specified project (defaulting to the current working directory).
	Note: Tasks should be specified in the format of `:task1 :task2`
2. Tasks can be run against multiple projects, by adding the projects to the command, such as `nyoom local exec project1 project2 my-awesome-project :build`
3. You may specify arbitrary commands to be executed without specifying the command as part of a task by using the syntax `^"command goes here"`
