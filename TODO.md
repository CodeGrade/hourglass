# TODO

See [ANOMALIES.md](ANOMALIES.md) for anomaly checking TODOs.

- the `contents` page for an exam should not be accessible by any means unless the exam is being loaded into the `show` page. (`exams_controller.rb:36`)
- `CodeTag` responses
- initial files for `Code` responses, like a fill-in-the-blank
- validate the exam upload
  - every exam should have at least an `exam.yaml`
  - filepicker code will not work if there are only empty directories [see here](https://github.com/CodeGrade/hourglass/commit/13677552dd95aefbcf64389adfd23cff5ddac7c1#commitcomment-33899283)
  - can get rid of `Upload` - exams should be able to handle their own files like `Registration`s do.
    - a bunch of code in `Upload` is taken from Bottlenose and is likely unnecessary.
- actually use SchemaChecker on uploaded exams' `exam.yaml`
- 6-digit PINs for students to check-in to exams based on exam salt and username
- notion of exam rooms
  - professor chooses the room they are in
  - "finalize exam for this room"
    - all submissions in *this* room are marked final, locking students out
- a way to sign students out if they finish early
  - a secret on the 'submitted' page
  - or just check their registration and make sure it is final
- a way to check if students disconnect from the internet
  - show active sessions, if one is dropped, make an anomaly
- files for the entire exam
- double check permissions for every controller action
- allow site admins to view any exam without a registration
  - there's some code in the exams controller that breaks if the user does not have an active registration for the exam
- find out if the exam network setup necessitates any changes to server
- "scratch space" for user taking exam
- export all final submissions as PDFs for manual grading
- export final submissions for each student, for upload to bottlenose for grading
  - bottlenose import feature
- download registrations (for a course) from bottlenose and upload them to hourglass (for an exam)
- only one session per user
  - [devise - session limitable](https://github.com/devise-security/devise-security)
- make logo for favicon, readme, navbar
- grab student first and last names from LDAP?
- add a license
