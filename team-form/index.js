const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("./config.json");
let app = express();
let url = `mongodb+srv://${config.username}:${config.userpassword}@${config.clustername}.${config.userstring}.mongodb.net/${config.dbname}?retryWrites=true&w=majority&appName=valtech`;

app.use(express.static(__dirname + "/public"));
app.use(express.json());

mongoose.connect(url)
    .then(res => console.log("Database Connected !!"))
    .catch(err => console.log("Error when connecting database :", err));

let schema = mongoose.Schema;
let ObjectId = mongoose.Schema.ObjectId;

let User = mongoose.model("User",
    new schema({
        id: ObjectId,
        firstname: String,
        lastname: String,
        email: { type: String, unique: true },
        password: String,
        role: { type: String, default: "user" }
    })
);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/signin.html");  
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/signup.html"); 
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log("Login request received:", req.body);

    User.findOne({ email })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (!isMatch) {
                    return res.status(401).json({ message: "Invalid credentials" });
                }

                res.status(200).json({ message: "Login successful", id: user._id, role: user.role });
            });
        })
        .catch((error) => {
            console.error("Error during login:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

app.post("/register", async (req, res) => {
    const { firstname, lastname, email, password, role } = req.body;

    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        role: role || "user"
    });

    try {
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.log("Error during registration:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/user", (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    User.findById(id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({ firstname: user.firstname, lastname: user.lastname, email: user.email });
        })
        .catch((error) => {
            console.error("Error fetching user details:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});


let Form = mongoose.model("Form",
    new schema({
        title: String,
        fields: [
            {
                question: { type: String, required: true },
                type: { type: String, required: true },
                options: [String], 
            }
        ],
        createdBy: { type: String, default: "Admin" }, 
    })
);

app.post("/save-form", (req, res) => {
    const { title, fields } = req.body;

    console.log("Received form data:", req.body);

    if (!title || !fields || !Array.isArray(fields)) {
        return res.status(400).json({ message: "Invalid form data. 'fields' must be an array." });
    }

    const newForm = new Form({
        title,
        fields,
    });

    newForm.save()
        .then(() => res.status(201).json({ message: "Form saved successfully" }))
        .catch((error) => {
            console.error("Error saving form:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});
app.get("/forms", (req, res) => {
    Form.find()
        .then((forms) => res.status(200).json(forms))
        .catch((error) => {
            console.error("Error fetching forms:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});
app.delete("/forms/:id", (req, res) => {
    Form.findByIdAndDelete(req.params.id)
      .then((deletedForm) => {
        if (!deletedForm) {
          return res.status(404).json({ message: "Form not found" });
        }
        res.status(200).json({ message: "Form deleted successfully" });
      })
      .catch((error) => {
        console.error("Error deleting form:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  });
let RegisteredForm = mongoose.model("RegisteredForm",
    new schema({
        useremail: { type: String, required: true },
        formid: { type: String, required: true },
        answers: [
            {
                question: String,
                answer: String
            }
        ],
        submittedAt: { type: Date, default: Date.now }
    })
);


app.post("/submit-form", (req, res) => {
    const { useremail, formid, answers } = req.body;

    if (!useremail || !formid || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Invalid form data" });
    }

   
    for (const answer of answers) {
        if (!answer.question || !answer.answer) {   
            return res.status(400).json({ message: "Each answer must contain a question and an answer" });
        }
    }

    const newRegisteredForm = new RegisteredForm({
        useremail,
        formid,
        answers
    });

    newRegisteredForm.save()
        .then(() => res.status(201).json({ message: "Form data saved successfully" }))
        .catch((error) => {
            console.error("Error saving form data:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

app.get("/forms/:id", (req, res) => {
    const { id } = req.params;

    Form.findById(id)
        .then(form => {
            if (!form) return res.status(404).json({ message: "Form not found" });
            res.status(200).json(form);
        })
        .catch(error => {
            console.error("Error fetching form:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

app.get("/registered-forms", async (req, res) => {
    try {
        const forms = await RegisteredForm.find();

        const results = await Promise.all(
            forms.map(async (entry) => {
                const form = await Form.findById(entry.formid);
                return {
                    _id: entry._id,
                    formId: entry.formid,
                    title: form ? form.title : "Untitled",
                    useremail: entry.useremail,
                    answers: entry.answers,
                    submittedAt: entry.submittedAt
                };
            })
        );

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching registered forms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.get("/registered-forms/:id", async (req, res) => {
    try {
        const registeredForm = await RegisteredForm.findById(req.params.id);
        if (!registeredForm) {
            return res.status(404).json({ message: "Registered form not found" });
        }

        const form = await Form.findById(registeredForm.formid);
        const title = form ? form.title : "Untitled";

        res.status(200).json({
            _id: registeredForm._id,
            formid: registeredForm.formid,
            title: form ? form.title : "Untitled",
            useremail: registeredForm.useremail,
            answers: registeredForm.answers,
            submittedAt: registeredForm.submittedAt
        });
    } catch (error) {
        console.error("Error fetching registered form:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.delete("/registered-forms/:id", (req, res) => {
    RegisteredForm.findByIdAndDelete(req.params.id)
        .then(deletedForm => {
            if (!deletedForm) {
                return res.status(404).json({ message: "Form not found" });
            }
            res.status(200).json({ message: "Form deleted successfully" });
        })
        .catch(error => {
            console.error("Error deleting form:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

  

app.listen(config.port, config.host, function (err) {
    if (err) {
        console.log("Error occur : ", err);
    }
});