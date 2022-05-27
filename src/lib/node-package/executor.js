const execute = (manager, props) => {
    props.printer.info(`Executing the manager ${manager.id}...`);
    manager.execute(props);
}

module.exports = {
    execute
}