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
