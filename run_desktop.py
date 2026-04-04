# run_desktop.py
from PyQt6.QtWidgets import QApplication
from nostrix_core import SovereignEngineCore
from your_pyqt6_ui import NostrixOmni  # your existing PyQt6 GUI class
import sys

if __name__ == "__main__":
    app = QApplication(sys.argv)
    core = SovereignEngineCore()
    win = NostrixOmni(core)  # pass core to GUI
    win.show()
    sys.exit(app.exec())
