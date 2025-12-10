from marshmallow import Schema, fields, validate

class LoginSchema(Schema):
    account_number = fields.String(required=True, validate=validate.Regexp(r"^\d{10,16}$"))
    pin = fields.String(required=True, validate=validate.Regexp(r"^\d{4,6}$"))

class RegisterSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    phone = fields.String(required=True, validate=validate.Regexp(r"^\d{10}$"))
    account_number = fields.String(required=True, validate=validate.Regexp(r"^\d{10,16}$"))
    pin = fields.String(required=True, validate=validate.Regexp(r"^\d{4,6}$"))

class AmountSchema(Schema):
    amount = fields.Float(required=True, validate=validate.Range(min=0.01))

class ChangePinSchema(Schema):
    current_pin = fields.String(required=True, validate=validate.Regexp(r"^\d{4,6}$"))
    new_pin = fields.String(required=True, validate=validate.Regexp(r"^\d{4,6}$"))

