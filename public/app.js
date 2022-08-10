// URL
// const URL = "https://health-tracker-web-app.herokuapp.com";
const URL = "http://localhost:8080";

// VUE 2 APP
var app = new Vue({
    // CONNECT TO APP ID
    el: '#app',
    // CONNECT VUETIFY
    vuetify: new Vuetify(),
    data: {
        // REGISTER PAGE VARIABLES
        registerEmail: "",
        emailRules: [
            v => !!v || 'E-mail is required',
            v => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'E-mail must be valid',
           ],
        registerUsername: "",
        usernameRules: [v => !!v || 'Username is required'],
        registerPassword: "",
        passwordRules: [
            v => !!v || 'Password is required',
            v => /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(v) || 'Password must contain at least lowercase letter, one number, a special character and one uppercase letter',
        ],
        registerConfirmPassword: "",
        registerAge: "",
        ageList: Array.from(new Array(84), (x, i) => i + 16),
        registerPasswordShow: false,
        confirmPasswordShow: false,

        // LOGIN PAGE VARIABLES
        loginEmail: "",
        loginPassword: "",
        loginPasswordShow: false,

        // PAGE VARIABLES
        currentPage: "login",

        // USER VARIABLES
        currentUserObject: {},
        currentUserName: "",
        currentUserAge: "",
        currentUserWeights: [],
        userId: "",

        // WEIGHT VARIABLES
        newWeight: "",
        last10WeightDates: [],
        last10Weights: [],

        // NAV BAR HAMBURGER MENU
        drawer: false,

        // CHART VARIABLES
        ctx: undefined,
        weightChart: undefined,

        // BMI VARIABLEs
        bmi: "",
        heightFeet: "",
        heightInches: "",

        // BMR VARIABLES
        bmr: "",
        heightFeetBMR: "",
        heightInchesBMR: "",
        genderSelect: "",
        activitySelect: "",

        // ERROR VARIABLE
        errorMessage: "",
    },
    methods: {
        // MATCH PASSWORDS FUNCTION
        matchPasswords: function () {
            if (!this.registerConfirmPassword) {
                return "Confirmed Password is required";
            } else if (this.registerPassword === this.registerConfirmPassword) {
                return true;
            } else {
                return 'Passwords do not match.';
            }
        },

        // SUBMIT REGISTER FORM FUNCTION
        submitRegisterForm () {
            if (this.$refs.form.validate()) {
                this.registerEmail = "";
                this.registerUsername = "";
                this.registerPassword = "";
                this.registerConfirmPassword = "";
                this.registerAge = "";
                this.$refs.form.resetValidation();
            }
        },

        // SUBMIT LOGIN FORM FUNCTION
        submitLoginForm () {
            this.$refs.form.resetValidation();
            this.loginEmail = "";
            this.loginPassword = "";
        },

        // SET PAGE FUNCTION
        setPage: function (page) {
            this.$refs.form.resetValidation();
            this.currentPage = page;
        },

        // GET SESSION FUNCTION
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                credentials: "include"
            });

            // CHECK IF SESSION EXISTS
            if (response.status === 200) {
                let data = await response.json();

                // GET USER ID
                this.userId = data.id;
                
                // GET USER BY ID
                this.getUser(this.userId);

                // SET PAGE TO WEIGHT
                this.setPage("weight");

                // DRAW WEIGHT CHART
                setTimeout(() => {
                    this.createWeightChart();
                }, 500);
                
            }
        },

        // CREATE USER FUNCTION
        createUser: async function () {
            if (this.$refs.form.validate()) {         
                let newUser = {
                    username: this.registerEmail,
                    password: this.registerPassword,
                    name: this.registerUsername,
                    age: this.registerAge,
                };

                // CREATE USER
                let response = await fetch(`${URL}/user`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newUser),
                    credentials: "include",
                });

                // CHECK FOR ERRORS
                if (response.status === 201) {
                    console.log("User created successfully");
                    this.setPage("login");
                    this.$refs.form.resetValidation()
                }
            }
        },    
        
        // LOGIN USER FUNCTION
        loginUser: async function () {
            let loginCredentials = {
                username: this.loginEmail,
                password: this.loginPassword
            };

            let response = await fetch(`${URL}/session`, {
                method: "POST",
                body: JSON.stringify(loginCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            // CHECK FOR ERRORS
            if (response.status == 201) {
                let data = await response.json();

                // GET USER ID
                this.userId = data.id;

                // GET USER BY ID
                this.getUser(this.userId);

                // SET PAGE TO WEIGHT
                this.setPage("weight");

                // RESET LOGIN FORM
                this.$refs.form.resetValidation()
            }
            else if (response.status == 400 || response.status == 401){
                console.log("Invalid credentials");
            }
        },

        // GET USER FUNCTION
        getUser: async function (id) { 
            let response = await fetch(URL + "/user/" + id);

            if (response.status == 200) {
                let data = await response.json();
                this.currentUserObject = data;
                this.currentUserName = data.name;
                this.currentUserAge = data.age;
                this.currentUserWeights = data.weights;

                if (this.currentUserWeights.length === 0) {
                    this.currentUserWeights.push({
                        date: new Date().toLocaleDateString(),
                        weight: "0",
                    });
                }
            } else {
                console.log("Error getting user:", response.status);
            }
        },

        // CALCULATE MAX HEART RATE FUNCTION
        calculateMaxHeartRate: function (age) {
            return 220 - age;
        },

        // CALCULTE TARGET HEART RATE FUNCTION
        calculateTargetHeartRate: function (age) {
            return Math.floor(this.calculateMaxHeartRate(age) * 0.8);
        },

        // POST NEW WEIGHT FUNCTION
        postNewWeight: async function () {
            if (this.newWeight && Number.isInteger(parseInt(this.newWeight)) && this.newWeight > 0) {
                let newWeightObj = {
                    date: new Date().toLocaleDateString(),
                    weight: parseInt(this.newWeight),
                };
    
                let response = await fetch(`${URL}/user/${this.userId}/weight`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newWeightObj),
                    credentials: "include",
                });
    
                // CHECK FOR ERRORS
                if (response.status === 200) {
                    console.log("Weight created successfully");
                    this.addWeightToChart(this.weightChart, newWeightObj.weight, newWeightObj.date);
                    this.newWeight = "";
                    this.getUser(this.userId);
                }
            } else {
                console.log("Please enter a weight");
            }
        },
        // SET UP CHART
        createWeightChart: function () {
            this.ctx = document.getElementById('weightChart');
            this.weightChart = new Chart(this.ctx, {
                type: 'line',
                data: {
                    labels: this.last10WeightDates,
                    datasets: [{
                        label: 'Previous Weight',
                        data: this.last10Weights,
                        backgroundColor: [
                            'rgba(255, 183, 3, 0.5)'
                        ],
                        borderColor: [
                            '#ffb703'
                        ],
                        borderWidth: 3,
                        fill: true,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                    }
                }
            });
        },

        // ADD WEIGHT TO CHART
        addWeightToChart: function (chart, weight, date) {
            chart.data.labels.push(date);
            chart.data.datasets.forEach((dataset) => {
                dataset.data.push(weight);
                if (chart.data.labels.length > 10) {
                    chart.data.labels.shift();
                    dataset.data.shift();
                }
            });
            chart.update();
        },

        // CALCULATE BMI FUNCTION
        calculateBmi: function (weight, heightFeet, heightInches) {
            let height = parseInt(heightFeet) * 12 + parseInt(heightInches);
            this.bmi = (parseInt(weight) / (height * height) * 703).toFixed(2);
        },

        // CALCULATE BMR FUNCTION
        calculateBmr: function (weight, heightFeet, heightInches, activity, gender) {
            let height = parseInt(heightFeet) * 12 + parseInt(heightInches);
            let heightCm = height * 2.54;
            let weightKg = parseInt(weight) * 0.45359237;

            if (gender === 'male') {
                let maleTempBmr = (10 * weightKg) + (6.25 * heightCm) - (5 * parseInt(this.currentUserAge)) + 5;
                if (activity === 'sedentary') {
                    this.bmr = Math.floor(maleTempBmr * 1.2);
                } else if (activity === 'lightlyActive') {
                    this.bmr = Math.floor(maleTempBmr * 1.375);
                } else if (activity === 'moderatelyActive') {
                    this.bmr = Math.floor(maleTempBmr * 1.55);
                } else if (activity === 'veryActive') {
                    this.bmr = Math.floor(maleTempBmr * 1.725);
                } else if (activity === 'extraActive') {
                    this.bmr = Math.floor(maleTempBmr * 1.9);
                } else {
                    this.bmr = Math.floor(maleTempBmr);
                }
            } else if (gender === 'female') {
                let femaleTempBmr = (10 * weightKg) + (6.25 * heightCm) - (5 * parseInt(this.currentUserAge)) - 161;
                if (activity === 'sedentary') {
                    this.bmr = Math.floor(femaleTempBmr * 1.2);
                } else if (activity === 'lightlyActive') {
                    this.bmr = Math.floor(femaleTempBmr * 1.375);
                } else if (activity === 'moderatelyActive') {
                    this.bmr = Math.floor(femaleTempBmr * 1.55);
                } else if (activity === 'veryActive') {
                    this.bmr = Math.floor(femaleTempBmr * 1.725);
                } else if (activity === 'extraActive') {
                    this.bmr = Math.floor(femaleTempBmr * 1.9);
                } else {
                    this.bmr = Math.floor(femaleTempBmr);
                }
            }
        },

        // SET ERROR MESSAGE FUNCTION
        setErrorMessage: function (message) {
            this.errorMessage = message;

            setTimeout(() => {
                this.errorMessage = "";
            }, 3000);
        }
        
    },
    created: function () {
        this.getSession();
    },
    computed: {
        // KEEP WEIGHT LIST AT MOST RECENT 10 WEIGHTS
        weightList: function () {
            this.last10WeightDates = [];
            this.last10Weights = [];
            this.currentUserWeights.slice(Math.max(this.currentUserWeights.length - 10, 1)).forEach(weightObj => {
                this.last10WeightDates.push(weightObj.date);
                this.last10Weights.push(weightObj.weight);
            });

            return this.currentUserWeights.slice(Math.max(this.currentUserWeights.length - 10, 1));
        },

        // SET TEXT COLOR BASED ON BMI
        setTextColor: function () {
            if (this.bmi === "") {
                return {'color': 'black'};
            } else if (this.bmi <= 18.4) {
                return {'color': '#FFE189'};
            } else if (this.bmi <= 24.9) {
                return {'color': '#8CD47E'};
            } else if (this.bmi <= 39.9) {
                return {'color': '#FFB54C'};
            } else {
                return {'color': '#FF6961'};
            }
        }

    }
});