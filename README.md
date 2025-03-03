### Demo

Demo

### ScreenShots

#### Sale Order Expanded

![alt text](imgs/expanded.png "Expanded")

#### Print Sales Order ID

![alt text](imgs/print-so-id.png "Print ID")

#### Sort Sales Order

![alt text](imgs/sort.png "Sort SOs")


### Conditions

- Sales order has been submitted
- Sales Order not completed
### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch main
bench install-app demo
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/demo
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

mit
