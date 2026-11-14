# Working on Peter's edits

These rules apply whenever Claude works for Peter in this repo. They add to the root `CLAUDE.md`; they do not replace it.

1. **Branch.** Work on the `peter` branch, never directly on `main`. If the branch is behind `main`, ask Peter before merging `main` into it.
2. **Where files go.** Peter's own notes, plans and drafts go in `peter/`. Edits Peter asks for elsewhere (the site, the agenda) are still allowed, on the `peter` branch, and must be logged.
3. **Log every edit.** Each change Peter asks for gets one entry at the top of `peter/EDIT-LOG.md` (newest first), written in the same commit as the change. Take the time from `TZ=America/Chicago date '+%Y-%m-%d %H:%M %Z'`, never from memory. Use this layout:

   ```
   ## YYYY-MM-DD HH:MM CST · Short title

   - **Asked for:** what Peter asked, in his words where possible
   - **What changed:** plain-English description a non-programmer can follow
   - **Why:** the reason or the problem it fixes
   - **Files:** each file touched, as a relative link
   - **How to check it:** what to open or click to see the change
   ```

   One request that touches many files is one entry. A follow-up fix is its own entry.
4. **Commits.** One commit per log entry, message starting `peter: `. The commit and the log entry describe the same change.
5. **Plain English.** Peter is the owner, not a programmer. Write entries and explanations so he can read them without knowing code.
6. **Keep the meeting notes current.** `peter/FOR-WILLIAM.md` is what Peter and William go through when they meet. In the same commit as the edit, add to it whenever any of these happen:
   - **A problem is found** in the project (a bug, a missing step in the docs, something that doesn't work the way people thought): a new row in section 1 with the next H number, what was wrong, what was done, and the status.
   - **William's code is changed**: a row in section 2.
   - **Something can only be proven later** (for example once carrier accounts are connected): a checkbox in section 3.
   - **A decision is left open** for Peter, William or Rin: a row in section 4 with the next D number. When it's decided, mark it and say what was decided.
   - **Something is left alone on purpose**: a line in section 5.
   Update the "Last updated" line with the time from the same `date` command. Don't remove items; mark them ✅ when they're done.
