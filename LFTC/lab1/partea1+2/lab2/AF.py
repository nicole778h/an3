class FiniteStateMachine:
    def __init__(self, alphabet, states, initial_state, transitions, final_states):
        self.alphabet = alphabet
        self.states = states
        self.initial_state = initial_state
        self.transitions = transitions
        self.final_states = final_states

    def get_alphabet(self):
        return self.alphabet

    def get_transitions(self):
        return self.transitions

    def get_final_states(self):
        return self.final_states

    def get_states(self):
        return self.states

    def check_sequence(self, sequence):
        prefix = ""
        current_state = self.initial_state
        print(f"Starea inițială: {current_state}")

        while sequence:
            found = False
            for transition in self.transitions:
                # Verificăm doar primul caracter din secvență
                if (
                        transition.get_source_state() == current_state
                        and transition.get_value() == sequence[0]
                ):
                    prefix += transition.get_value()
                    sequence = sequence[1:]  # Avansăm cu un singur caracter
                    current_state = transition.get_destination_state()
                    found = True
                    print(f"Tranziție găsită: {transition.get_source_state()} -> {transition.get_destination_state()} "
                          f"cu valoarea '{transition.get_value()}'")
                    break
            if not found:
                print(f"Tranziție nevalidă. Stare curentă: {current_state}, Secvență rămasă: {sequence}")
                return False

        if current_state in self.final_states:
            print("Secvența este validă.")
            return True

        print("Secvența nu s-a terminat într-o stare finală.")
        return False

    def get_longest_prefix(self, sequence):
        prefix = ""
        current_state = self.initial_state

        while sequence:
            found = False
            for transition in self.transitions:
                if (
                    transition.get_source_state() == current_state
                    and transition.get_value() == sequence[: len(transition.get_value())]
                ):
                    prefix += transition.get_value()
                    sequence = sequence[len(transition.get_value()) :]
                    current_state = transition.get_destination_state()
                    found = True
                    break
            if not found:
                return prefix

        return prefix