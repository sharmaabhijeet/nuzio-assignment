// Validators return only accepted, normalized fields. Never overwrite Express 5's query getter.
export function validate(source, validator) {
  return (req, res, next) => {
    req.validated ??= {};
    req.validated[source] = validator(req[source]);
    next();
  };
}
