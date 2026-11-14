# Peter's section

This folder is Peter's own workspace in the repo. Peter's notes, plans and edits are kept here, and every edit is logged with its date and time in [EDIT-LOG.md](EDIT-LOG.md).

## How it stays separate from William's work

| Piece | What it does |
|---|---|
| **The `peter` branch** | Peter's edits are saved to a branch named `peter`, not to `main`. Nothing on `main`, and nothing on the live site, changes until Peter and William agree to merge. |
| **This `peter/` folder** | Peter's own files: this README, the edit log, and any notes or drafts. William's files are not touched from here. |
| **[EDIT-LOG.md](EDIT-LOG.md)** | One entry per edit, newest first, with date, time (Central), what changed, why, and which files. |

When Peter's work does need to change the website or another part of the repo, the change still goes on the `peter` branch and is logged here, so William can review it before it reaches `main`.

## How William sees Peter's work

- On GitHub, switch the branch picker from `main` to `peter`, or open the [peter branch](https://github.com/wbp318/goin-postal-forsythe/tree/peter).
- To see everything that differs from `main`: [compare main...peter](https://github.com/wbp318/goin-postal-forsythe/compare/main...peter).
- On his own computer: `git fetch origin peter` then `git switch peter`.

## How Peter works on it

On his own computer, from the repo folder:

```
git switch peter      # move onto Peter's branch
git pull              # get the latest of Peter's branch
```

To bring in William's newest work from `main` without mixing up the two:

```
git switch peter
git merge main
```

In a Claude Code session, ask Claude to work on the `peter` branch. Claude follows [CLAUDE.md](CLAUDE.md) in this folder and adds a log entry for every edit.

## Contents

| File | What it is |
|---|---|
| [README.md](README.md) | This page |
| [EDIT-LOG.md](EDIT-LOG.md) | Every edit, dated and timed |
| [TODO.md](TODO.md) | Peter's to-do list: ideas for later, with the steps for each |
| [FOR-WILLIAM.md](FOR-WILLIAM.md) | Meeting notes for Peter and William: problems found, changes to William's code, things to check later, decisions waiting |
| [CLAUDE.md](CLAUDE.md) | Instructions Claude follows when working on Peter's edits |
