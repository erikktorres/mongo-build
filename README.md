mongo-build
===========

Scripts to build and run mongo DB with SSL on Ubuntu 13.10.

Master reflects whatever latest edits were made.  We tag for each version of Mongo using the structure

```
v<mongo-version>_#
```

Where 

* `mongo-version` is the version of mongo that is being built.
* `#` is the revision of the build script (a monotonically increasing number, higher is better

The branch to make edits for building an old mongo will be named

```
v<mongo-version>
```

That is, the tag name without a revision number.

