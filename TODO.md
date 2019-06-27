# TODO

See [ANOMALIES.md](ANOMALIES.md) for anomaly checking TODOs.

- the `contents` page for an exam should not be accessible by any means unless the exam is being loaded into the `show` page. (`exams_controller.rb:36`)
- `CodeTag` responses
- validate the exam upload
  - every exam should have at least an `exam.yaml`
  - filepicker code will not work if there are only empty directories [see here](https://github.com/CodeGrade/hourglass/commit/13677552dd95aefbcf64389adfd23cff5ddac7c1#commitcomment-33899283)
- files for the entire exam
- double check permissions for every controller action
- allow site admins to view any exam without a registration
  - there's some code in the exams controller that breaks if the user does not have an active registration for the exam
- find out if the exam network setup necessitates any changes to server
- make logo for favicon, readme, navbar
- grab student first and last names from LDAP?
- add a license
